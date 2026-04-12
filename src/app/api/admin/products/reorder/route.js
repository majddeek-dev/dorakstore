// /api/admin/products/reorder/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const items = await request.json(); // Array of { id, sortOrder }
    
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Prisma doesn't support bulk updates with varying values directly,
    // so we use a transaction
    const updatePromises = items.map(item => 
      prisma.product.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder }
      })
    );
    
    await prisma.$transaction(updatePromises);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
