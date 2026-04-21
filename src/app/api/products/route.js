import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = searchParams.get('page');
    const limit = searchParams.get('limit') || 20;
    const sort = searchParams.get('sort') || 'default';
    const admin = searchParams.get('admin') === 'true'; // إذا كان الطلب من الأدمن لا نطبق الفلاتر

    const where = {};
    
    if (category && category !== 'all') {
      where.OR = [{ category }, { categoryId: category }];
    }

    // إذا لم يكن الطلب من الأدمن، أظهر المنتجات النشطة والتي حان موعد نشرها فقط
    if (!admin) {
      where.isActive = true;
      where.OR = [
        { publishAt: null },
        { publishAt: { lte: new Date() } }
      ];
      // في حال كان هناك category سابق في ال OR بسبب الفئة
      if (category && category !== 'all') {
         const categoryCond = [{ category }, { categoryId: category }];
         const publishCond = [{ publishAt: null }, { publishAt: { lte: new Date() } }];
         where.OR = undefined;
         where.AND = [
           { OR: categoryCond },
           { OR: publishCond }
         ];
      }
    }

    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      if (!where.AND) where.AND = [];
      where.AND.push({
        name: { contains: searchQuery, mode: 'insensitive' }
      });
    }

    // تحديد الترتيب
    let orderBy = { sortOrder: 'asc' };
    if (sort === 'latest' || sort === 'new') orderBy = { createdAt: 'desc' };
    else if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };

    const include = { priceRules: true }; // جلب قواعد السعر

    if (page) {
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 20;
      const skip = (pageNum - 1) * limitNum;

      const [products, totalCount] = await Promise.all([
        prisma.product.findMany({
          where,
          orderBy: [orderBy, { createdAt: 'desc' }], // fallback للترتيب
          skip,
          take: limitNum,
          include
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
      orderBy: [orderBy, { createdAt: 'desc' }],
      include
    });

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const productData = {
      name: data.name,
      category: data.category,
      categoryId: data.categoryId || null,
      price: parseFloat(data.price),
      costPrice: data.costPrice ? parseFloat(data.costPrice) : 0,
      oldPrice: data.oldPrice ? parseFloat(data.oldPrice) : null,
      badge: data.badge || null,
      desc: data.desc || null,
      stock: parseInt(data.stock || 0),
      imageUrl: data.imageUrl || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
      publishAt: data.publishAt ? new Date(data.publishAt) : null,
      sortOrder: parseInt(data.sortOrder || 0),
    };

    const product = await prisma.product.create({
      data: productData,
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

