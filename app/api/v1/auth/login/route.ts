import { NextRequest, NextResponse } from 'next/server';
import { applySessionCookie } from '@/lib/auth/session';
import { apiError } from '@/lib/auth/request';
import { isAppError } from '@/lib/server/errors';
import { login } from '@/lib/server/modules/auth/auth.service';

/**
 * POST /api/v1/auth/login
 *
 * MVP: credentials checked against mock users. JWT signed with jose;
 * httpOnly cookie for dashboards + `data.token` for Flutter Bearer auth.
 */
export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const { user, token } = await login(body);

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
    console.error('[v1/auth/login] unexpected', err);
    return apiError('Unable to login', 500);
  }
}
