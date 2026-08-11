import { NextRequest, NextResponse } from 'next/server';
import {
  apiError,
  isAuthError,
  requireAuth,
} from '@/lib/auth/request';
import { sendFcmNotificationToUsers } from '@/lib/notifications/fcm-service';

/**
 * POST /api/v1/notifications/send
 *
 * Platform admin only. Targets user accounts, not raw tokens.
 * Body:
 * {
 *   audience: 'all' | 'selected';
 *   userIds?: string[];   // required when audience=selected
 *   title: string;
 *   body: string;
 *   data?: Record<string, string>;
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req, ['super_admin', 'staff']);
    if (isAuthError(auth)) return auth;

    const payload = await req.json();
    const { audience = 'all', userIds, title, body, data, imageUrl } = payload;

    if (!title || !body) {
      return apiError('Missing required notification fields: title and body', 400);
    }

    if (audience !== 'all' && audience !== 'selected') {
      return apiError('audience must be "all" or "selected"', 400);
    }

    const result = await sendFcmNotificationToUsers({
      audience,
      userIds,
      title,
      body,
      data,
      imageUrl,
    });

    if (!result.success) {
      return apiError(result.error || 'FCM notification dispatch failed', 500);
    }

    return NextResponse.json({
      data: {
        ...result,
        message: 'Push notification sent successfully',
      },
      error: null,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to dispatch push notification';
    console.error('[notifications/send] Error:', err);
    return apiError(msg, 500);
  }
}
