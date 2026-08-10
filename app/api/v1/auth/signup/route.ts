import { NextRequest, NextResponse } from 'next/server';
import { applySessionCookie } from '@/lib/auth/session';
import { apiError } from '@/lib/auth/request';
import { isAppError } from '@/lib/server/errors';
import { signup } from '@/lib/server/modules/auth/auth.service';

/** POST /api/v1/auth/signup — create driver account + JWT. */
export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const { user, token } = await signup(body);

    const response = NextResponse.json({
      data: { user, token },
      error: null,
    });
    applySessionCookie(response, token);
    return response;
  } catch (err) {
    if (isAppError(err)) {
      return apiError(err.message, err.status);
    }
    console.error('[v1/auth/signup] unexpected', err);
    return apiError('Unable to signup', 500);
  }
}
