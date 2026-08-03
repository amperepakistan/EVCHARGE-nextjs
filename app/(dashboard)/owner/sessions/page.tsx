import { PageHeader } from '@/components/ui/page-header';
import { StatTile } from '@/components/ui/stat-tile';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { getOwnerScope } from '@/lib/mock/scope';
import { terminalById, terminalsForOwner } from '@/lib/mock/terminals';
import { mockSessions } from '@/lib/mock/operations';
import type { MockSession } from '@/lib/mock/types';

const columns: Column<MockSession>[] = [
  {
    key: 'driver',
    header: 'Driver',
    render: (s) => <span className="font-mono text-xs">{s.driverLabel}</span>,
  },
  {
    key: 'charger',
    header: 'Charger',
    render: (s) => (
      <span className="text-text-secondary text-xs">{terminalById(s.terminalId)?.name}</span>
    ),
  },
  {
    key: 'started',
    header: 'Started',
    render: (s) => <span className="text-text-secondary text-xs">{s.startedAt}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (s) =>
      s.noShow ? (
        <Badge tone="danger">No-show</Badge>
      ) : s.endedAt === null ? (
        <Badge tone="warning">Charging</Badge>
      ) : (
        <Badge tone="success">Completed</Badge>
      ),
  },
  {
    key: 'kwh',
    header: 'Energy',
    align: 'right',
    render: (s) => <span className="tabular-nums">{s.kwhDelivered.toFixed(1)} kWh</span>,
  },
  {
    key: 'amount',
    header: 'Amount',
    align: 'right',
    render: (s) => (
      <span className="font-heading font-bold tabular-nums">
        Rs {s.amountCharged.toLocaleString()}
      </span>
    ),
  },
];

export default async function OwnerSessionsPage() {
  const { ownerId } = await getOwnerScope();
  const ids = terminalsForOwner(ownerId).map((t) => t.id);
  const sessions = mockSessions.filter((s) => ids.includes(s.terminalId));

  const live = sessions.filter((s) => s.endedAt === null && !s.noShow);
  const noShows = sessions.filter((s) => s.noShow);
  const avgKwh =
    sessions.length > 0
      ? sessions.reduce((sum, s) => sum + s.kwhDelivered, 0) / sessions.length
      : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sessions & reservations"
        description="Charging activity at your site, including reservations that were never honoured."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile label="Charging now" value={live.length} variant="ink" />
        <StatTile
          label="No-shows"
          value={noShows.length}
          hint="Reserved but never plugged in"
          tone={noShows.length > 0 ? 'warning' : 'default'}
        />
        <StatTile label="Avg session" value={`${avgKwh.toFixed(1)} kWh`} hint="Across all bays" />
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
}
