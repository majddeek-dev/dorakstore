import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.globalSetting.findMany();
    const settingsMap = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
    return NextResponse.json(settingsMap);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
