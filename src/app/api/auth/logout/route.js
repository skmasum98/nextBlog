import { serialize } from 'cookie';
import { NextResponse } from 'next/server';

export async function GET() {
  // Create a cookie that is expired
  const serializedCookie = serialize('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: -1, // Set maxAge to a past date to expire the cookie
    path: '/',
  });

  const response = NextResponse.json({ message: 'Logged out successfully' });
  response.headers.set('Set-Cookie', serializedCookie);

  return response;
}