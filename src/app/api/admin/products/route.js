import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

// Admin-only: fetch ALL products including inactive ones
export async function GET(request) {
  const auth = await requireAdmin(request);
  if (auth.ok !== true) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const where = search
      ? { name: { contains: search, mode: 'insensitive' } }
      : {};

    const products = await prisma.product.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: { priceRules: true },
    });

    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
