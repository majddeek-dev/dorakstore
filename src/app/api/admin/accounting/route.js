import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [orders, expenses] = await Promise.all([
      prisma.order.findMany({
        where: { status: 'مكتمل' },
        include: {
          items: {
            include: { product: true }
          }
        }
      }),
      prisma.expense.findMany()
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    
    const totalCOGS = orders.reduce((sum, order) => {
      const orderCost = order.items.reduce((itemSum, item) => {
        const cost = item.product?.costPrice || 0;
        return itemSum + (cost * item.quantity);
      }, 0);
      return sum + orderCost;
    }, 0);

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    const grossProfit = totalRevenue - totalCOGS;
    const netProfit = grossProfit - totalExpenses;
    const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return NextResponse.json({
      totalRevenue,
      totalCOGS,
      totalExpenses,
      grossProfit,
      netProfit,
      margin,
      orderCount: orders.length,
      expenseCount: expenses.length
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
