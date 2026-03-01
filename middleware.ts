import { NextResponse } from 'next/server';
import { auth } from "./auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnAdminPanel = req.nextUrl.pathname.startsWith('/admin');

  // Если не авторизован и лезет в админку -> на логин
  if (isOnAdminPanel && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Если авторизован, но НЕ админ, и лезет в админку -> на профиль
  if (isOnAdminPanel && isLoggedIn) {
    const role = (req.auth?.user as any)?.role;
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/profile', req.url));
    }
  }

  return NextResponse.next();
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|images|favicon.ico).*)'],
}
