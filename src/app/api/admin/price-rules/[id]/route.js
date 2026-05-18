import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { productId, minQty, price, label } = body;

    const rule = await prisma.priceRule.update({
      where: { id },
      data: { 
        productId, 
        minQty: parseInt(minQty, 10), 
        price: parseFloat(price), 
        label 
      },
    });
    return NextResponse.json(rule);
  } catch (error) {
    console.error('Price Rules API error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.priceRule.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Price Rules API error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
