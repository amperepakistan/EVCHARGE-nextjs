import { getMessaging } from '@/lib/firebase/admin';
import type { MulticastMessage } from 'firebase-admin/messaging';
import {
  deletePushTokens,
  listPushTokenRows,
  type PushTokenRow,
} from '@/lib/server/modules/notifications/push-tokens.repository';
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

const STALE_TOKEN_CODES = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
]);

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

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

function explainFcmFailures(codes: string[], platforms: string[]): string {
  const unique = [...new Set(codes.filter(Boolean))];
  const joined = unique.join(', ');
  const ios = platforms.includes('ios');

  if (
    unique.some(
      (code) =>
        code.includes('third-party-auth') ||
        code.includes('mismatched-credential') ||
        /apns/i.test(code),
    )
  ) {
    return 'Firebase could not talk to Apple Push (APNs). In Firebase Console → ampere-ac9f0 → Project settings → Cloud Messaging → Apple app, upload the APNs Authentication Key (.p8) for pk.ampere.app.';
  }

  if (unique.some((code) => STALE_TOKEN_CODES.has(code) || code.includes('invalid-argument'))) {
    return ios
      ? 'The iPhone token is invalid or from an old build. Install the latest TestFlight build, open Ampere while signed in, allow notifications, then refresh this page.'
      : 'The saved device token is invalid. Ask that driver to force-quit Ampere and open it again while signed in, then refresh this page.';
  }

  if (unique.some((code) => code.includes('sender-id') || code.includes('mismatched-sender'))) {
    return 'FCM sender mismatch: the app token is from a different Firebase project than the server service account.';
  }

  if (ios) {
    return `All iOS deliveries failed${joined ? ` (${joined})` : ''}. Confirm the APNs .p8 key is uploaded in Firebase Console for pk.ampere.app, then reopen Ampere on a real iPhone.`;
  }

  return joined
    ? `All device deliveries failed (${joined}).`
    : 'All device deliveries failed. Tokens may be stale.';
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

    const rows = await listPushTokenRows(supabaseServer(), targetUserIds);
    if (rows.length === 0) {
      return {
        success: false,
        successCount: 0,
        failureCount: 0,
        deviceCount: 0,
        userCount: targetUserIds.length,
        error:
          audience === 'all'
            ? 'No registered devices found. Ask drivers to open Ampere while signed in, then refresh this page.'
            : 'Selected drivers have no registered devices. Ask them to open Ampere while signed in, then refresh.',
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
        headers: {
          'apns-priority': '10',
          'apns-push-type': 'alert',
        },
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
    const failureCodes: string[] = [];
    const staleRows: PushTokenRow[] = [];

    for (const batch of chunk(rows, 500)) {
      const response = await messaging.sendEachForMulticast({
        ...base,
        tokens: batch.map((row) => row.fcmToken),
      });
      successCount += response.successCount;
      failureCount += response.failureCount;

      response.responses.forEach((item, index) => {
        if (item.success) return;
        const row = batch[index];
        const code = item.error?.code ?? 'unknown';
        const message = item.error?.message ?? '';
        failureCodes.push(code);
        console.error('[FCM Service] token delivery failed', {
          userId: row?.userId,
          platform: row?.platform,
          code,
          message,
        });
        if (row && (STALE_TOKEN_CODES.has(code) || /not registered|invalid/i.test(message))) {
          staleRows.push(row);
        }
      });
    }

    if (staleRows.length > 0) {
      try {
        await deletePushTokens(supabaseServer(), staleRows);
      } catch (err) {
        console.error('[FCM Service] failed to prune stale tokens', err);
      }
    }

    return {
      success: successCount > 0,
      successCount,
      failureCount,
      deviceCount: rows.length,
      userCount: targetUserIds.length,
      error:
        successCount === 0
          ? explainFcmFailures(
              failureCodes,
              rows.map((row) => row.platform),
            )
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
