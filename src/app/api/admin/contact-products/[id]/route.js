import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, price, oldPrice, imageUrl, whatsappNum } = body;

    const product = await prisma.contactProduct.update({
      where: { id },
      data: {
        name,
        price: price !== undefined && price !== null && price !== "" ? parseFloat(price) : null,
        oldPrice: oldPrice !== undefined && oldPrice !== null && oldPrice !== "" ? parseFloat(oldPrice) : null,
        imageUrl: imageUrl || null,
        whatsappNum: whatsappNum || null
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating contact product:", error);
    return NextResponse.json({ error: "فشل في تحديث المنتج" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await prisma.contactProduct.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting contact product:", error);
    return NextResponse.json({ error: "فشل في إزالة المنتج" }, { status: 500 });
  }
}
