import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      take: 4,
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Latest products error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
