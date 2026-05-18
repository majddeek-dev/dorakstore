import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  // Block in production — this endpoint is for development only
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    return NextResponse.json({ success: true, message: 'Database connection is successful!', result });
  } catch (error) {
    console.error('Test DB Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Database connection failed.', 
      error: error.message,
    }, { status: 500 });
  }
}
