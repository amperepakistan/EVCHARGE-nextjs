import { NextRequest, NextResponse } from 'next/server';
import {
  apiError,
  isAuthError,
  requireAuth,
} from '@/lib/auth/request';
import { upsertPushToken } from '@/lib/server/modules/notifications/push-tokens.repository';
import { supabaseServer } from '@/lib/supabase/server';

/**
 * POST /api/v1/notifications/register-token
 *
 * Auth required (Bearer JWT from Flutter).
 * Body: { token: string, platform?: 'android' | 'ios' | 'web' }
 * Links the FCM device token to the logged-in user account.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (isAuthError(auth)) return auth;

    const body = await req.json();
    const { token, platform = 'android' } = body as {
      token?: string;
      platform?: 'android' | 'ios' | 'web';
    };

    if (!token || typeof token !== 'string') {
      return apiError('fcmToken is required', 400);
    }

    const validPlatform =
      platform === 'ios' || platform === 'web' || platform === 'android'
        ? platform
        : 'android';

    try {
      await upsertPushToken(supabaseServer(), {
        userId: auth.userId,
        fcmToken: token,
        platform: validPlatform,
      });
    } catch (err) {
      console.error(
        '[notifications/register-token] store failed:',
        err instanceof Error ? err.message : err,
      );
      return apiError('Failed to store push token', 500);
    }

    return NextResponse.json({
      data: {
        success: true,
        message: 'FCM token registered for user account',
        userId: auth.userId,
      },
      error: null,
    });
  } catch (err: unknown) {
    console.error('[notifications/register-token] Error:', err);
    return apiError('Failed to register push token', 500);
  }
}
