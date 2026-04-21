import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { buyProductId, buyCategoryId, minPrice, getProductId, getCategoryId, isActive } = body;

    const offer = await prisma.giftOffer.update({
      where: { id },
      data: { 
        buyProductId: buyProductId || null, 
        buyCategoryId: buyCategoryId || null, 
        minPrice: minPrice ? parseFloat(minPrice) : null, 
        getProductId: getProductId || null, 
        getCategoryId: getCategoryId || null,
        isActive 
      },
    });
    return NextResponse.json(offer);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await prisma.giftOffer.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
