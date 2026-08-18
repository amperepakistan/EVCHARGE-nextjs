import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { StatTile } from '@/components/ui/stat-tile';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/ui/data-table';
import { formatMoney } from '@/lib/screenshot-mode';
import { requireAdminDashboard } from '@/lib/server/dashboard';
import * as driversAdmin from '@/lib/server/modules/admin/drivers-admin.service';
import { DriverAccountForms } from '@/components/features/admin/driver-account-forms';
import { isAppError } from '@/lib/server/errors';

type SessionRow = {
  id: string;
  terminal_name: string | null;
  terminal_id: string;
  started_at: string;
  ended_at: string | null;
  kwh_delivered: number | null;
  amount_charged: number | null;
};

const sessionColumns: Column<SessionRow>[] = [
  {
    key: 'charger',
    header: 'Charger',
    render: (s) => (
      <span className="text-text-secondary text-xs">
        {s.terminal_name ?? s.terminal_id.slice(0, 8)}
      </span>
    ),
  },
  {
    key: 'started',
    header: 'Started',
    render: (s) => (
      <span className="text-text-secondary text-xs">
        {new Date(s.started_at).toLocaleString()}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (s) =>
      s.ended_at === null ? (
        <Badge tone="warning">Charging</Badge>
      ) : (
        <Badge tone="success">Completed</Badge>
      ),
  },
  {
    key: 'kwh',
    header: 'Energy',
    align: 'right',
    render: (s) => (
      <span className="tabular-nums">{Number(s.kwh_delivered ?? 0).toFixed(1)} kWh</span>
    ),
  },
  {
    key: 'amount',
    header: 'Amount',
    align: 'right',
    render: (s) => (
      <span className="font-heading font-bold tabular-nums">
        {formatMoney(Number(s.amount_charged ?? 0))}
      </span>
    ),
  },
];

export default async function AdminDriverDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { ctx } = await requireAdminDashboard();

  let driver;
  try {
    driver = await driversAdmin.getDriver(ctx, id);
  } catch (err) {
    if (isAppError(err) && err.status === 404) notFound();
    throw err;
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/drivers"
          className="text-text-secondary hover:text-text-primary mb-3 inline-flex items-center gap-1.5 text-xs font-semibold"
        >
          <ArrowLeft className="size-3.5" />
          All drivers
        </Link>
        <PageHeader
          title={driver.fullName ?? 'Driver'}
          description={driver.email ?? 'No email on file'}
          action={
            driver.isActive === false ? (
              <Badge tone="danger">Inactive</Badge>
            ) : (
              <Badge tone="success">Active</Badge>
            )
          }
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Sessions" value={driver.sessionCount} variant="ink" />
        <StatTile label="Energy" value={`${driver.totalKwh.toFixed(1)} kWh`} />
        <StatTile label="Vehicle" value={driver.preferredVehicleKey ?? 'Not set'} />
        <StatTile label="Phone" value={driver.phoneNumber ?? '—'} />
      </div>

      <Card>
        <h2 className="font-heading text-base font-bold">Profile</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-text-secondary text-xs font-semibold tracking-wide uppercase">
              Full name
            </dt>
            <dd className="text-text-primary mt-1 text-sm font-semibold">
              {driver.fullName ?? '—'}
            </dd>
          </div>
          <div>
            <dt className="text-text-secondary text-xs font-semibold tracking-wide uppercase">
              Email
            </dt>
            <dd className="text-text-primary mt-1 text-sm font-semibold">
              {driver.email ?? '—'}
            </dd>
          </div>
          <div>
            <dt className="text-text-secondary text-xs font-semibold tracking-wide uppercase">
              Preferred vehicle
            </dt>
            <dd className="text-text-primary mt-1 text-sm font-semibold">
              {driver.preferredVehicleKey ?? 'Not set'}
            </dd>
          </div>
          <div>
            <dt className="text-text-secondary text-xs font-semibold tracking-wide uppercase">
              Registered
            </dt>
            <dd className="text-text-primary mt-1 text-sm font-semibold">
              {new Date(driver.createdAt).toLocaleString()}
            </dd>
          </div>
        </dl>
      </Card>

      {driver.userId ? (
        <DriverAccountForms driverId={driver.id} currentEmail={driver.email} />
      ) : (
        <Card>
          <p className="text-text-secondary text-sm">
            This driver row has no linked user account, so password and email cannot be
            changed here.
          </p>
        </Card>
      )}

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-bold tracking-tight">Recent sessions</h2>
        <DataTable
          columns={sessionColumns}
          rows={driver.recentSessions}
          getRowKey={(s) => s.id}
          emptyTitle="No sessions"
          emptyMessage="Charging activity for this driver will appear here."
        />
      </section>
    </div>
  );
}
