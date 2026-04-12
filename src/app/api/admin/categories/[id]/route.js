import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const { name, imageUrl } = await req.json();
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

    const cat = await prisma.category.update({
      where: { id },
      data: { name, imageUrl: imageUrl || null },
    });
    return NextResponse.json(cat);
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "هذا الاسم مستخدم بالفعل" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    // Optional: Check if products are linked. For now, let's just delete or disconnect.
    await prisma.category.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
