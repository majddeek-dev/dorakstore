import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    return NextResponse.json({ success: true, message: 'Database connection is successful!', result });
  } catch (error) {
    console.error('Test DB Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Database connection failed.', 
      error: error.message,
      code: error.code,
      env_db_url: process.env.DATABASE_URL ? 'PRESENT' : 'MISSING'
    }, { status: 500 });
  }
}
