import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(coupons);
  } catch (error) {
    console.error('Coupons GET error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { code, discountPercent } = await request.json();

    const pct = parseFloat(discountPercent);
    if (!code || isNaN(pct)) {
      return NextResponse.json({ error: 'Code and valid discount percentage are required' }, { status: 400 });
    }
    if (pct < 0 || pct > 100) {
      return NextResponse.json({ error: 'نسبة الخصم يجب أن تكون بين 0 و 100' }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountPercent: pct
      }
    });

    return NextResponse.json(coupon);
  } catch (error) {
    return NextResponse.json({ error: 'Promo code already exists or invalid data' }, { status: 400 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Coupon DELETE error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
