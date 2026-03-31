import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [users, guestOrders] = await Promise.all([
      prisma.user.findMany({
        include: {
          orders: true
        }
      }),
      prisma.order.findMany({
        where: { userId: null },
        include: { items: true }
      })
    ]);

    const combinedCustomers = [];

    // Map registered users
    users.forEach(u => {
      combinedCustomers.push({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        type: 'member', // "عضو"
        orderCount: u.orders.length,
        totalSpent: u.orders.reduce((sum, o) => sum + o.total, 0),
        lastOrder: u.orders.length > 0 ? u.orders.sort((a, b) => b.createdAt - a.createdAt)[0].createdAt : u.createdAt,
        region: u.orders.length > 0 ? u.orders[0].region : '—'
      });
    });

    // Map guests (aggregated by phone)
    const guestMap = guestOrders.reduce((acc, o) => {
      const key = o.customerPhone;
      if (!acc[key]) {
        acc[key] = {
          name: o.customerName,
          phone: o.customerPhone,
          email: '—',
          region: o.region,
          type: 'guest', // "ضيف"
          orderCount: 0,
          totalSpent: 0,
          lastOrder: o.createdAt
        };
      }
      acc[key].orderCount += 1;
      acc[key].totalSpent += o.total;
      if (new Date(o.createdAt) > new Date(acc[key].lastOrder)) {
        acc[key].lastOrder = o.createdAt;
      }
      return acc;
    }, {});

    Object.values(guestMap).forEach(g => {
      combinedCustomers.push(g);
    });

    // Sort by most recent or most spent
    combinedCustomers.sort((a, b) => new Date(b.lastOrder) - new Date(a.lastOrder));

    return NextResponse.json(combinedCustomers);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
