import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'dk7-store-super-secret-key-2026';

export async function GET() {
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
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { customerName, customerPhone, region, address, total, items } = body;

    // Optional: Get userId from token
    let userId = null;
    const token = request.cookies.get('user_token')?.value;
    if (token) {
      try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        userId = payload.userId;
      } catch (e) {
        console.error('Failed to verify user token in order creation', e);
      }
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
          create: items.map(item => ({
            productId: item.id,
            quantity: item.qty,
            price: item.price
          }))
        }
      },
      include: { items: true }
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
