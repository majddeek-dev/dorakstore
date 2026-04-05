import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = searchParams.get('page');
    const limit = searchParams.get('limit') || 10;

    const where = category && category !== 'all' 
      ? { OR: [{ category }, { categoryId: category }] } 
      : {};

    if (page) {
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      const skip = (pageNum - 1) * limitNum;

      const [products, totalCount] = await Promise.all([
        prisma.product.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limitNum,
        }),
        prisma.product.count({ where })
      ]);

      return NextResponse.json({
        products,
        totalPages: Math.ceil(totalCount / limitNum),
        currentPage: pageNum,
        totalCount
      });
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const product = await prisma.product.create({
      data,
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
