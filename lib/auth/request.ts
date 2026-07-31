import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, type JwtPayload } from '@/lib/auth/jwt';
import { SESSION_COOKIE } from '@/lib/auth/session';
import type { UserRole } from '@/types/database.types';

export type ApiSuccess<T> = { data: T; error: null };
export type ApiFailure = { data: null; error: string };

export function apiOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data, error: null } satisfies ApiSuccess<T>, init);
}

export function apiError(message: string, status: number) {
  return NextResponse.json({ data: null, error: message } satisfies ApiFailure, { status });
}

/**
 * Resolve auth from Bearer header (Flutter) or session cookie (dashboard).
 */
export async function requireAuth(
  req: NextRequest,
  allowedRoles?: UserRole[],
): Promise<JwtPayload | NextResponse> {
  const header = req.headers.get('authorization');
  let token: string | undefined;

  if (header?.startsWith('Bearer ')) {
    token = header.slice('Bearer '.length).trim();
  } else {
    token = req.cookies.get(SESSION_COOKIE)?.value;
  }

  if (!token) {
    return apiError('Unauthorized', 401);
  }

  try {
    const payload = await verifyToken(token);
    if (allowedRoles && !allowedRoles.includes(payload.role)) {
      return apiError('Forbidden', 403);
    }
    return payload;
  } catch {
    return apiError('Invalid token', 401);
  }
}

export function isAuthError(value: JwtPayload | NextResponse): value is NextResponse {
  return value instanceof NextResponse;
}
