import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';
import { signToken, verifyToken, type JwtPayload } from '@/lib/auth/jwt';

export const SESSION_COOKIE = 'evcharge_session';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

export async function setSessionCookie(response: NextResponse, payload: JwtPayload) {
  const token = await signToken(payload);
  applySessionCookie(response, token);
  return token;
}

/** Attach an already-signed JWT as the dashboard session cookie. */
export function applySessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE, token, COOKIE_OPTIONS);
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, '', { ...COOKIE_OPTIONS, maxAge: 0 });
}

/** Read session from the dashboard httpOnly cookie (Server Components / Route Handlers). */
export async function getSessionFromCookies(): Promise<JwtPayload | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}
