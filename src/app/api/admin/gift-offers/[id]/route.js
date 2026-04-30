import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request, props) {
  try {
    const params = await props.params;
    const { id } = params;
    const body = await request.json();
    const { buyProductId, buyCategoryIds, minPrice, getProductId, getCategoryIds, isActive } = body;

    const offer = await prisma.giftOffer.update({
      where: { id },
      data: { 
        buyProductId: buyProductId || null, 
        buyCategories: { set: buyCategoryIds?.length ? buyCategoryIds.map(id => ({ id })) : [] },
        minPrice: minPrice ? parseFloat(minPrice) : null, 
        getProductId: getProductId || null, 
        getCategories: { set: getCategoryIds?.length ? getCategoryIds.map(id => ({ id })) : [] },
        isActive 
      },
    });
    return NextResponse.json(offer);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, props) {
  try {
    const params = await props.params;
    const { id } = params;
    await prisma.giftOffer.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
