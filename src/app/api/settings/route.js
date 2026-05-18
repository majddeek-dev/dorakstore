import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Only these keys are safe to expose publicly
const PUBLIC_KEYS = [
  'ANNOUNCEMENT_BAR_ENABLED',
  'ANNOUNCEMENT_BAR_TEXT',
  'ENABLE_FREE_SHIPPING',
  'FREE_SHIPPING_THRESHOLD',
  'member_discount_percent',
];

export async function GET() {
  try {
    const settings = await prisma.globalSetting.findMany({
      where: { key: { in: PUBLIC_KEYS } }
    });
    const settingsMap = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
    return NextResponse.json(settingsMap);
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
