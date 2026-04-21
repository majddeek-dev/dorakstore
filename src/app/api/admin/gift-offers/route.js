import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const giftOffers = await prisma.giftOffer.findMany({
      include: {
        buyProduct: true,
        buyCategory: true,
        getProduct: true,
        getCategory: true
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
    const { buyProductId, buyCategoryId, minPrice, getProductId, getCategoryId, isActive } = body;

    const newOffer = await prisma.giftOffer.create({
      data: {
        buyProductId: buyProductId || null,
        buyCategoryId: buyCategoryId || null,
        minPrice: minPrice ? parseFloat(minPrice) : null,
        getProductId: getProductId || null,
        getCategoryId: getCategoryId || null,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        buyProduct: true,
        buyCategory: true,
        getProduct: true,
        getCategory: true
      }
    });

    return NextResponse.json(newOffer, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
