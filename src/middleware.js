import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'dk7-store-super-secret-key-2026';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow login page and API admin routes to pass through
  if (pathname === '/admin/login' || pathname.startsWith('/api/admin/')) {
    return NextResponse.next();
  }

  // Protect all /admin routes
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch {
      // Token invalid or expired — clear cookie and redirect
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.set('admin_token', '', { maxAge: 0, path: '/' });
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
