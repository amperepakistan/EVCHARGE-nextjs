import { PageHeader } from '@/components/ui/page-header';
import {
  SendPushForm,
  type PushRecipientOption,
} from '@/components/features/admin/send-push-form';
import { requireAdminDashboard } from '@/lib/server/dashboard';
import * as driversAdmin from '@/lib/server/modules/admin/drivers-admin.service';
import { listPushTokenRows } from '@/lib/server/modules/notifications/push-tokens.repository';

export default async function AdminNotificationsPage() {
  const { ctx } = await requireAdminDashboard();
  const drivers = await driversAdmin.listDrivers(ctx);

  const userIds = drivers
    .map((d) => d.userId)
    .filter((id): id is string => Boolean(id));

  const tokenCountByUser = new Map<string, number>();
  if (userIds.length > 0) {
    const tokens = await listPushTokenRows(ctx.db, userIds);
    for (const row of tokens) {
      tokenCountByUser.set(row.userId, (tokenCountByUser.get(row.userId) ?? 0) + 1);
    }
  }

  const recipients: PushRecipientOption[] = drivers
    .filter((d): d is typeof d & { userId: string } => Boolean(d.userId))
    .map((d) => ({
      userId: d.userId,
      fullName: d.fullName,
      email: d.email,
      deviceCount: tokenCountByUser.get(d.userId) ?? 0,
    }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Notifications"
        description="Send push notifications to driver accounts via FCM."
      />

      <div className="max-w-xl">
        <SendPushForm recipients={recipients} />
      </div>
    </div>
  );
}
