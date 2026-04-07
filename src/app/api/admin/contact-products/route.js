import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const products = await prisma.contactProduct.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching contact products:", error);
    return NextResponse.json({ error: "فشل في جلب منتجات التواصل" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, price, oldPrice, imageUrl, whatsappNum } = body;

    if (!name) {
      return NextResponse.json({ error: "اسم المنتج مطلوب" }, { status: 400 });
    }

    const product = await prisma.contactProduct.create({
      data: {
        name,
        price: price ? parseFloat(price) : null,
        oldPrice: oldPrice ? parseFloat(oldPrice) : null,
        imageUrl: imageUrl || null,
        whatsappNum: whatsappNum || null
      }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating contact product:", error);
    return NextResponse.json({ error: "فشل في إضافة منتج التواصل" }, { status: 500 });
  }
}
