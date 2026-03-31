import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cats = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(cats);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { name } = await req.json();
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
    
    const cat = await prisma.category.create({
      data: { name },
    });
    return NextResponse.json(cat);
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "الفئة موجودة مسبقاً" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
