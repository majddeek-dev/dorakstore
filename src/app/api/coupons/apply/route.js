import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const { code } = await request.json();

    if (!code) return NextResponse.json({ error: 'Code is required' }, { status: 400 });

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: 'كود الخصم غير صحيح أو منتهي الصلاحية' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      code: coupon.code,
      discountPercent: coupon.discountPercent
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
