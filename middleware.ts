import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Wrap initialization in try-catch: if AUTH_SECRET is missing or NextAuth
// fails on Edge, the module still loads and the fallback logic works.
let authMiddleware: any;
try {
  authMiddleware = NextAuth(authConfig).auth;
} catch (e) {
  console.error('[Middleware] NextAuth init failed:', e);
}

export default async function middleware(request: NextRequest) {
  // If NextAuth initialized, delegate to it
  if (authMiddleware) {
    try {
      return await authMiddleware(request);
    } catch (error) {
      console.error('[Middleware] Auth error:', error);
    }
  }

  // Fallback: protect admin routes even if NextAuth is unavailable
  if (request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|images|css|favicon.ico|favicon.svg|robots.txt|bootstrap.bundle.min.js).*)',
  ],
}
