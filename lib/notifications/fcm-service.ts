import { getMessaging } from '@/lib/firebase/admin';
import type { MulticastMessage } from 'firebase-admin/messaging';
import { supabaseServer } from '@/lib/supabase/server';

export interface SendPushToUsersOptions {
  /** When empty / omitted with audience=all, send to every registered driver token. */
  userIds?: string[];
  audience: 'all' | 'selected';
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

export type SendPushToUsersResult = {
  success: boolean;
  successCount: number;
  failureCount: number;
  deviceCount: number;
  userCount: number;
  error?: string;
};

async function resolveTargetUserIds(
  audience: 'all' | 'selected',
  userIds?: string[],
): Promise<string[]> {
  if (audience === 'selected') {
    return Array.from(new Set((userIds ?? []).filter(Boolean)));
  }

  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'driver')
    .eq('is_active', true);

  if (error) throw new Error(error.message);
  return (data ?? []).map((u) => u.id);
}

async function loadTokensForUsers(userIds: string[]): Promise<string[]> {
  if (userIds.length === 0) return [];

  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from('user_push_tokens')
    .select('fcm_token')
    .in('user_id', userIds);

  if (error) throw new Error(error.message);

  const tokens = (data ?? []).map((row) => row.fcm_token).filter(Boolean);
  return Array.from(new Set(tokens));
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

export async function sendFcmNotificationToUsers({
  audience,
  userIds,
  title,
  body,
  data = {},
  imageUrl,
}: SendPushToUsersOptions): Promise<SendPushToUsersResult> {
  try {
    const targetUserIds = await resolveTargetUserIds(audience, userIds);
    if (audience === 'selected' && targetUserIds.length === 0) {
      return {
        success: false,
        successCount: 0,
        failureCount: 0,
        deviceCount: 0,
        userCount: 0,
        error: 'Select at least one driver account.',
      };
    }

    const tokens = await loadTokensForUsers(targetUserIds);
    if (tokens.length === 0) {
      return {
        success: false,
        successCount: 0,
        failureCount: 0,
        deviceCount: 0,
        userCount: targetUserIds.length,
        error:
          audience === 'all'
            ? 'No registered devices found. Drivers must open the app while logged in.'
            : 'Selected drivers have no registered devices.',
      };
    }

    const messaging = getMessaging();
    const base: Omit<MulticastMessage, 'tokens'> = {
      notification: {
        title,
        body,
        ...(imageUrl ? { imageUrl } : {}),
      },
      data,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'high_importance_channel',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    let successCount = 0;
    let failureCount = 0;

    for (const batch of chunk(tokens, 500)) {
      const response = await messaging.sendEachForMulticast({
        ...base,
        tokens: batch,
      });
      successCount += response.successCount;
      failureCount += response.failureCount;
    }

    return {
      success: successCount > 0,
      successCount,
      failureCount,
      deviceCount: tokens.length,
      userCount: targetUserIds.length,
      error:
        successCount === 0
          ? 'All device deliveries failed. Tokens may be stale.'
          : undefined,
    };
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : 'Failed to send FCM push notification';
    console.error('[FCM Service] Error sending to users:', error);
    return {
      success: false,
      successCount: 0,
      failureCount: 0,
      deviceCount: 0,
      userCount: 0,
      error: msg,
    };
  }
}
