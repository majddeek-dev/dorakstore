import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [totalOrders, totalProducts, orders] = await Promise.all([
      prisma.order.count(),
      prisma.product.count(),
      prisma.order.findMany({
        select: { total: true, status: true, createdAt: true },
      }),
    ]);

    const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
    const pendingOrders = orders.filter(o => o.status === 'قيد المعالجة').length;

    // Today's revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRevenue = orders
      .filter(o => new Date(o.createdAt) >= today)
      .reduce((s, o) => s + o.total, 0);

    // Unique customers (by phone) — approximated via order count
    const uniqueCustomers = await prisma.order.groupBy({
      by: ['customerPhone'],
      _count: true,
    });

    return NextResponse.json({
      totalOrders,
      totalProducts,
      totalRevenue,
      pendingOrders,
      todayRevenue,
      totalCustomers: uniqueCustomers.length,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
