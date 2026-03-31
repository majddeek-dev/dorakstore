import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Get Top Selling IDs based on OrderItem quantities
    const topSales = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 4
    });

    let products = [];

    if (topSales.length > 0) {
      const topIds = topSales.map(item => item.productId);
      
      // 2. Fetch the corresponding Products
      products = await prisma.product.findMany({
        where: {
          id: {
            in: topIds
          }
        }
      });

      // Maintain the order from the aggregation
      products = topIds.map(id => products.find(p => p.id === id)).filter(Boolean);
    } else {
      // 3. Fallback: Get the 4 newest products if no sales exist
      products = await prisma.product.findMany({
        take: 4,
        orderBy: {
          createdAt: 'desc'
        }
      });
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error("Top products error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
