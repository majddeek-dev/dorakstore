import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { buyProductId, getProductId, isActive } = body;

    const offer = await prisma.giftOffer.update({
      where: { id },
      data: { buyProductId, getProductId, isActive },
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
