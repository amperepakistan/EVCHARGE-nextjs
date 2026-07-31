import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/auth/session';
import { verifyToken } from '@/lib/auth/jwt';

const DASHBOARD_PREFIXES = ['/vendor', '/owner', '/admin'];

function isDashboardPath(pathname: string) {
  return DASHBOARD_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!isDashboardPath(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const session = await verifyToken(token);
    const roleHome: Record<string, string> = {
      vendor: '/vendor',
      owner: '/owner',
      super_admin: '/admin',
      staff: '/admin',
    };

    // Keep roles inside their own dashboard tree
    if (pathname.startsWith('/vendor') && session.role !== 'vendor' && session.role !== 'super_admin') {
      return NextResponse.redirect(new URL(roleHome[session.role] ?? '/login', req.url));
    }
    if (pathname.startsWith('/owner') && session.role !== 'owner' && session.role !== 'super_admin') {
      return NextResponse.redirect(new URL(roleHome[session.role] ?? '/login', req.url));
    }
    if (
      pathname.startsWith('/admin') &&
      session.role !== 'super_admin' &&
      session.role !== 'staff'
    ) {
      return NextResponse.redirect(new URL(roleHome[session.role] ?? '/login', req.url));
    }

    return NextResponse.next();
  } catch {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('next', pathname);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 });
    return res;
  }
}

export const config = {
  matcher: ['/vendor/:path*', '/owner/:path*', '/admin/:path*'],
};
