import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth/session';

/** POST /api/v1/auth/logout — clear dashboard cookie. Flutter discards its stored JWT. */
export async function POST() {
  const response = NextResponse.json({ data: { ok: true }, error: null });
  clearSessionCookie(response);
  return response;
}
