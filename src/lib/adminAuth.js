import { jwtVerify } from 'jose';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Verifies the admin_token cookie on an incoming API request.
 * Returns { ok: true } if valid, or a NextResponse 401 if not.
 */
export async function requireAdmin(request) {
  if (!JWT_SECRET) {
    console.error('SECURITY: JWT_SECRET is not set in environment variables!');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  const token = request.cookies.get('admin_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    await jwtVerify(token, secret);
    return { ok: true };
  } catch {
    return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
  }
}
