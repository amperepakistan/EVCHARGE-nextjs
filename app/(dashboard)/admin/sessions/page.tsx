import { PageHeader } from '@/components/ui/page-header';
import { StatTile } from '@/components/ui/stat-tile';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { formatMoney } from '@/lib/screenshot-mode';
import { requireAdminDashboard } from '@/lib/server/dashboard';
import * as adminService from '@/lib/server/modules/admin/admin.service';
import type { NetworkSessionRow } from '@/lib/server/modules/admin/admin.repository';

const columns: Column<NetworkSessionRow>[] = [
  {
    key: 'driver',
    header: 'Driver',
    render: (s) => (
      <span className="font-mono text-xs">
        {s.driver_id ? s.driver_id.slice(0, 8) : 'Guest'}
      </span>
    ),
  },
  {
    key: 'charger',
    header: 'Charger',
    render: (s) => (
      <span className="text-text-secondary text-xs">
        {s.terminal_name ?? s.terminal_id}
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

export default async function AdminSessionsPage() {
  const { ctx } = await requireAdminDashboard();
  const sessions = await adminService.listNetworkSessions(ctx);
  const live = sessions.filter((s) => s.ended_at === null);
  const totalKwh = sessions.reduce((sum, s) => sum + Number(s.kwh_delivered ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Network sessions"
        description="Recent charging activity across every site."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile label="Charging now" value={live.length} variant="ink" />
        <StatTile label="Listed" value={sessions.length} hint="Most recent sessions" />
        <StatTile label="Energy" value={`${totalKwh.toFixed(1)} kWh`} hint="Across listed rows" />
      </div>

      <DataTable
        columns={columns}
        rows={sessions}
        getRowKey={(s) => s.id}
        emptyTitle="No sessions"
        emptyMessage="Charging activity will appear here once drivers start sessions."
      />
    </div>
  );
}
