import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    // update combo main fields
    await prisma.combo.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        discountPercent: data.discountPercent !== undefined ? parseFloat(data.discountPercent) : undefined,
        isActive: data.isActive !== undefined ? data.isActive : undefined,
      }
    });

    // If items are provided, replace them completely
    if (data.items && Array.isArray(data.items)) {
      await prisma.comboItem.deleteMany({ where: { comboId: id } });
      if (data.items.length > 0) {
        await prisma.comboItem.createMany({
          data: data.items.map(item => ({
            comboId: id,
            productId: item.productId,
            quantity: parseInt(item.quantity || 1)
          }))
        });
      }
    }

    const updatedCombo = await prisma.combo.findUnique({
      where: { id },
      include: { items: true }
    });

    return NextResponse.json(updatedCombo);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    // Cascade delete on combo items handles deleting items automatically
    await prisma.combo.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
