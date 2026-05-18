import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Check if requester is admin
    const adminAuth = await requireAdmin(request);
    if (adminAuth.ok === true) return NextResponse.json(order);

    // Check if requester is the order owner
    if (order.userId && JWT_SECRET) {
      const userToken = request.cookies.get('user_token')?.value;
      if (userToken) {
        try {
          const secret = new TextEncoder().encode(JWT_SECRET);
          const { payload } = await jwtVerify(userToken, secret);
          if (payload.userId === order.userId) {
            return NextResponse.json(order);
          }
        } catch { /* invalid token */ }
      }
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  } catch (error) {
    console.error('Order GET error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const auth = await requireAdmin(request);
  if (auth.ok !== true) return auth;

  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!status || typeof status !== 'string') {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json(order);
  } catch (error) {
    console.error('Order PATCH error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
