import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const products = await prisma.contactProduct.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20 // limit to recent ones for the home page
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching public contact products:", error);
    return NextResponse.json({ error: "فشل في جلب المنتجات" }, { status: 500 });
  }
}
