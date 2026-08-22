import { NextRequest, NextResponse } from 'next/server';
import { applySessionCookie } from '@/lib/auth/session';
import { apiError } from '@/lib/auth/request';
import { isAppError } from '@/lib/server/errors';
import { verifyOtp } from '@/lib/server/modules/auth/otp.service';

/**
 * POST /api/v1/auth/otp/verify
 *
 * Driver app step 2: exchange phone + code for a session. First successful
 * verification for a number creates the driver account, so there is no
 * separate signup call. Response shape matches `/auth/login` (`data.token` +
 * `data.user`) so the Flutter client parses both the same way.
 */
export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const { user, token, isNewUser } = await verifyOtp(body);

    const response = NextResponse.json({
      data: { user, token, isNewUser },
      error: null,
    });
    applySessionCookie(response, token);
    return response;
  } catch (err) {
    if (isAppError(err)) {
      return apiError(err.message, err.status);
    }
    console.error('[v1/auth/otp/verify] unexpected', err);
    return apiError('Unable to verify code', 500);
  }
}
