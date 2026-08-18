import { PageHeader } from '@/components/ui/page-header';
import { StatTile } from '@/components/ui/stat-tile';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { requireOwnerDashboard, TenantAccessError } from '@/lib/server/dashboard';
import { formatMoney } from '@/lib/screenshot-mode';
import { TenantDenied } from '@/components/features/dashboard/tenant-denied';
import * as sessionsService from '@/lib/server/modules/sessions/sessions.service';
import type { SessionListRow } from '@/lib/server/modules/sessions/sessions.repository';

const columns: Column<SessionListRow>[] = [
  {
    key: 'driver',
    header: 'Driver',
    render: (s) => (
      <span className="font-mono text-xs">{s.driver_id ? s.driver_id.slice(0, 8) : 'Guest'}</span>
    ),
  },
  {
    key: 'charger',
    header: 'Charger',
    render: (s) => (
      <span className="text-text-secondary text-xs">{s.terminal_name ?? s.terminal_id}</span>
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
      <span className="tabular-nums">
        {Number(s.kwh_delivered ?? 0).toFixed(1)} kWh
      </span>
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

export default async function OwnerSessionsPage() {
  try {
    const { ctx, scope } = await requireOwnerDashboard();
    const sessions = await sessionsService.listOwnerSessions(ctx, scope.ownerId);

    const live = sessions.filter((s) => s.ended_at === null);
    const avgKwh =
      sessions.length > 0
        ? sessions.reduce((sum, s) => sum + Number(s.kwh_delivered ?? 0), 0) / sessions.length
        : 0;

    return (
      <div className="space-y-6">
        <PageHeader
          title="Sessions & reservations"
          description="Charging activity at your site."
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <StatTile label="Charging now" value={live.length} variant="ink" />
          <StatTile
            label="Total listed"
            value={sessions.length}
            hint="Most recent sessions"
          />
          <StatTile label="Avg session" value={`${avgKwh.toFixed(1)} kWh`} hint="Across listed rows" />
        </div>

        <DataTable
          columns={columns}
          rows={sessions}
          getRowKey={(s) => s.id}
          emptyTitle="No sessions yet"
          emptyMessage="Charging activity at your site will appear here."
        />
      </div>
    );
  } catch (err) {
    if (err instanceof TenantAccessError) {
      return <TenantDenied title="Sessions" message={err.message} />;
    }
    throw err;
  }
}
