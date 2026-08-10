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
    // `driver` (and any future role) has no dashboard home. Falling through to
    // `/login` while still holding a valid cookie bounced them in a loop, so
    // unknown roles go to the public site instead.
    const roleHome: Record<string, string> = {
      vendor: '/vendor',
      owner: '/owner',
      super_admin: '/admin',
      staff: '/admin',
    };
    const home = roleHome[session.role] ?? '/';

    // Keep roles inside their own dashboard tree. Platform admins may enter
    // vendor/owner trees after selecting a tenant from /admin.
    const platformAdmin = session.role === 'super_admin' || session.role === 'staff';
    if (pathname.startsWith('/vendor') && session.role !== 'vendor' && !platformAdmin) {
      return NextResponse.redirect(new URL(home, req.url));
    }
    if (pathname.startsWith('/owner') && session.role !== 'owner' && !platformAdmin) {
      return NextResponse.redirect(new URL(home, req.url));
    }
    if (pathname.startsWith('/admin') && !platformAdmin) {
      return NextResponse.redirect(new URL(home, req.url));
    }

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-pathname', pathname);
    return NextResponse.next({ request: { headers: requestHeaders } });
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
