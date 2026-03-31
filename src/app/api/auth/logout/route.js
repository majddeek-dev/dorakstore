import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Log out successful' });
  response.cookies.set('user_token', '', { maxAge: 0, path: '/' });
  return response;
}
