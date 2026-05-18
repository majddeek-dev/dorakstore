import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { requireAdmin } from '@/lib/adminAuth';

const JWT_SECRET = process.env.JWT_SECRET;

// Admin-only: list all orders
export async function GET(request) {
  const auth = await requireAdmin(request);
  if (auth.ok !== true) return auth;

  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(orders);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

const SHIPPING_RATES = {
  'الضفة الغربية': 20,
  'القدس': 30,
  'مناطق 48 (الداخل)': 70,
  'قطاع غزة': 30,
};

// Public: create a new order — total is RECALCULATED server-side
export async function POST(request) {
  try {
    const body = await request.json();
    const { customerName, customerPhone, region, address, items, couponCode } = body;

    if (!customerName || !customerPhone || !region || !address || !items?.length) {
      return NextResponse.json({ error: 'بيانات الطلب غير مكتملة' }, { status: 400 });
    }

    // --- Recalculate total server-side ---
    const productIds = [...new Set(items.map(i => i.id).filter(Boolean))];
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      include: { priceRules: true },
    });
    const productMap = Object.fromEntries(dbProducts.map(p => [p.id, p]));

    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      // Allow gift items (price 0) — but do not trust the id, skip if realProductId unknown
      if (item.isGift) {
        validatedItems.push({ productId: item.realProductId || item.id, quantity: item.qty || 1, price: 0 });
        continue;
      }
      const product = productMap[item.id];
      if (!product) continue; // Skip unknown products silently

      // Check price rules (volume discount)
      let unitPrice = product.price;
      if (product.priceRules?.length) {
        const rule = product.priceRules
          .filter(r => item.qty >= r.minQty)
          .sort((a, b) => b.minQty - a.minQty)[0];
        if (rule) unitPrice = rule.price;
      }

      subtotal += unitPrice * (item.qty || 1);
      validatedItems.push({ productId: product.id, quantity: item.qty || 1, price: unitPrice });
    }

    // Member discount
    let userId = null;
    const userToken = request.cookies.get('user_token')?.value;
    let memberDiscountAmount = 0;
    if (userToken && JWT_SECRET) {
      try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jwtVerify(userToken, secret);
        userId = payload.userId;
        // Fetch member discount setting
        const setting = await prisma.globalSetting.findUnique({ where: { key: 'member_discount_percent' } });
        if (setting) {
          const pct = parseFloat(setting.value) || 0;
          memberDiscountAmount = subtotal * (pct / 100);
        }
      } catch { /* invalid token — no member discount */ }
    }

    // Coupon discount
    let couponDiscountAmount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
      if (coupon && coupon.isActive) {
        couponDiscountAmount = subtotal * (coupon.discountPercent / 100);
      }
    }

    const afterDiscounts = Math.max(0, subtotal - memberDiscountAmount - couponDiscountAmount);

    // Shipping
    const freeShippingSetting = await prisma.globalSetting.findUnique({ where: { key: 'ENABLE_FREE_SHIPPING' } });
    const thresholdSetting = await prisma.globalSetting.findUnique({ where: { key: 'FREE_SHIPPING_THRESHOLD' } });
    const freeShippingEnabled = freeShippingSetting?.value === 'true';
    const threshold = parseFloat(thresholdSetting?.value || '500');
    const isFreeShipping = freeShippingEnabled && afterDiscounts >= threshold;
    const shipping = isFreeShipping ? 0 : (SHIPPING_RATES[region] || 0);

    const total = Math.max(0, afterDiscounts + shipping);

    if (validatedItems.length === 0) {
      return NextResponse.json({ error: 'لا توجد منتجات صالحة في الطلب' }, { status: 400 });
    }

    const order = await prisma.order.create({
      data: {
        userId,
        customerName,
        customerPhone,
        region,
        address,
        total,
        items: {
          create: validatedItems
        }
      },
      include: { items: true }
    });

    return NextResponse.json(order, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء الطلب' }, { status: 500 });
  }
}
