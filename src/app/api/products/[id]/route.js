import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { priceRules: true }
    });
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    // Preparation for priceRules update if needed, but handled separately usually
    // or we can allow deleting existing rules and inserting new ones here if they come in `data.priceRules`

    const updateData = {
      name: data.name,
      category: data.category,
      categoryId: data.categoryId || null,
      price: parseFloat(data.price),
      costPrice: data.costPrice ? parseFloat(data.costPrice) : 0,
      oldPrice: data.oldPrice ? parseFloat(data.oldPrice) : null,
      badge: data.badge || null,
      desc: data.desc || null,
      stock: parseInt(data.stock),
      imageUrl: data.imageUrl || null,
      isActive: data.isActive !== undefined ? data.isActive : undefined,
      publishAt: data.publishAt !== undefined ? (data.publishAt ? new Date(data.publishAt) : null) : undefined,
      sortOrder: data.sortOrder !== undefined ? parseInt(data.sortOrder) : undefined,
    };

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    // Delete order items that reference this product first
    await prisma.orderItem.deleteMany({ where: { productId: id } });
    await prisma.comboItem.deleteMany({ where: { productId: id } });
    await prisma.priceRule.deleteMany({ where: { productId: id } });
    
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
