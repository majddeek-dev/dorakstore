import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const giftOffers = await prisma.giftOffer.findMany({
      include: {
        buyProduct: true,
        getProduct: true
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
    const { buyProductId, getProductId, isActive } = body;

    const newOffer = await prisma.giftOffer.create({
      data: {
        buyProductId,
        getProductId,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        buyProduct: true,
        getProduct: true
      }
    });

    return NextResponse.json(newOffer, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
