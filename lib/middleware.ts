import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Get the 'isLoggedIn' cookie we set during login
  const isLoggedIn = request.cookies.get('isLoggedIn');
  const userRole = request.cookies.get('userRole')?.value;

  // 2. Define which path you want to protect
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard');

  // 3. Logic: If trying to access dashboard without being logged in
  if (isDashboardPage && !isLoggedIn) {
    // Redirect them to login page
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Optional: If they are logged in but NOT an admin, prevent access to dashboard
  if (isDashboardPage && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/items', request.url));
  }

  return NextResponse.next();
}

// 4. Specify which routes this middleware should run on
export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*'],
};