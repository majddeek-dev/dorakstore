import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const combos = await prisma.combo.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(combos);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    // validate inputs
    if (!data.name || !data.discountPercent || !data.items || !data.items.length) {
      return NextResponse.json({ error: 'Missing required combo fields' }, { status: 400 });
    }

    const combo = await prisma.combo.create({
      data: {
        name: data.name,
        description: data.description,
        discountPercent: parseFloat(data.discountPercent),
        isActive: data.isActive !== undefined ? data.isActive : true,
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            quantity: parseInt(item.quantity || 1)
          }))
        }
      },
      include: {
        items: true
      }
    });

    return NextResponse.json(combo, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
