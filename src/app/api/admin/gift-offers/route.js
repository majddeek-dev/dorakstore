import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const giftOffers = await prisma.giftOffer.findMany({
      include: {
        buyProduct: true,
        buyCategories: true,
        getProduct: true,
        getCategories: true
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(giftOffers);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { buyProductId, buyCategoryIds, minPrice, getProductId, getCategoryIds, isActive } = body;

    const newOffer = await prisma.giftOffer.create({
      data: {
        buyProductId: buyProductId || null,
        buyCategories: buyCategoryIds?.length ? { connect: buyCategoryIds.map(id => ({ id })) } : undefined,
        minPrice: minPrice ? parseFloat(minPrice) : null,
        getProductId: getProductId || null,
        getCategories: getCategoryIds?.length ? { connect: getCategoryIds.map(id => ({ id })) } : undefined,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        buyProduct: true,
        buyCategories: true,
        getProduct: true,
        getCategories: true
      }
    });

    return NextResponse.json(newOffer, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
