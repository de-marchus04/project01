import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simplified middleware (NextAuth Edge middleware disabled due to Vercel dxb1 outage)
// Admin protection is handled server-side in the admin page component
export default function middleware(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|images|favicon.ico).*)'],
}
