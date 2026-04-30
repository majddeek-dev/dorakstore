import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const combos = await prisma.combo.findMany({
      where: { isActive: true },
      include: {
        items: true
      }
    });

    const priceRules = await prisma.priceRule.findMany();

    const giftOffers = await prisma.giftOffer.findMany({
      where: { isActive: true },
      include: {
        getProduct: true,
        getCategories: true,
        buyProduct: true,
        buyCategories: true
      }
    });

    return NextResponse.json({
      combos,
      priceRules,
      giftOffers
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
