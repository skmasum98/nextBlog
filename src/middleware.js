import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const tokenCookie = request.cookies.get('token');
  const token = tokenCookie?.value;

  const publicPaths = ['/login', '/register'];
  const adminPaths = ['/admin']; // Add this line

  // Redirect logged-in users from public paths
  if (publicPaths.includes(pathname) && token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (error) { /* Invalid token, do nothing */ }
  }

  // --- ADMIN PATH PROTECTION ---
  if (adminPaths.some(path => pathname.startsWith(path))) {
    if (!token) {
      // Not logged in, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      if (payload.role !== 'admin') {
        // Logged in but NOT an admin, redirect to user dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (error) {
      // Invalid token, redirect to login and clear cookie
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }
  
  // --- GENERAL PROTECTED PATHS (excluding admin and public paths) ---
  const protectedPaths = ['/dashboard', '/posts/create']; // Add other protected paths here
  if (protectedPaths.some(path => pathname.startsWith(path))) {
      if (!token) {
          return NextResponse.redirect(new URL('/login', request.url));
      }
      try {
          await jwtVerify(token, JWT_SECRET);
      } catch (error) {
          const response = NextResponse.redirect(new URL('/login', request.url));
          response.cookies.delete('token');
          return response;
      }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};