import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth/session';

export async function POST() {
  const response = NextResponse.json({ data: { ok: true }, error: null });
  clearSessionCookie(response);
  return response;
}
