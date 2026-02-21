import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = request.nextUrl.pathname === '/login';
  const isRoot = request.nextUrl.pathname === '/';

  // Raíz → redirige según si tiene token o no
  if (isRoot) {
    return NextResponse.redirect(
      new URL(token ? '/admin' : '/login', request.url)
    );
  }

  // Sin token intenta entrar a /admin → redirige a login
  if (isAdminRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Con token intenta entrar a /login → redirige al dashboard
  if (isLoginPage && token) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin/:path*', '/login'],  // ← agregá '/'
};