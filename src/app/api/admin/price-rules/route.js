import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const rules = await prisma.priceRule.findMany({
      include: {
        product: true
      }
    });
    return NextResponse.json(rules);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { productId, minQty, price, label } = body;

    const newRule = await prisma.priceRule.create({
      data: {
        productId,
        minQty: parseInt(minQty, 10),
        price: parseFloat(price),
        label
      },
      include: {
        product: true
      }
    });

    return NextResponse.json(newRule, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
