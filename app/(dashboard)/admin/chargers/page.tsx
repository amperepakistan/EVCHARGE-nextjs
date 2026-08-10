import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { StatusDot, STATUS_LABELS } from '@/components/ui/status-dot';
import { requireAdminDashboard } from '@/lib/server/dashboard';
import * as adminService from '@/lib/server/modules/admin/admin.service';
import * as terminalsService from '@/lib/server/modules/terminals/terminals.service';
import type { TerminalStatus } from '@/types/database.types';

type ChargerRow = {
  id: string;
  name: string;
  city: string | null;
  status: TerminalStatus | 'unknown';
  connectivity_tier: string;
  power_kw: number | null;
  vendorName: string | null;
  ownerName: string | null;
  lastSeen: string | null;
};

const columns: Column<ChargerRow>[] = [
  {
    key: 'name',
    header: 'Charger',
    render: (t) => (
      <div className="min-w-0">
        <p className="text-text-primary truncate font-semibold">{t.name}</p>
        <p className="text-text-secondary truncate text-xs">{t.city ?? '—'}</p>
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (t) => (
      <span className="flex items-center gap-2 whitespace-nowrap">
        <StatusDot status={t.status} />
        <span className="text-text-secondary text-xs font-semibold">
          {STATUS_LABELS[t.status]}
        </span>
      </span>
    ),
  },
  {
    key: 'vendor',
    header: 'Vendor',
    render: (t) => (
      <span className="text-text-secondary text-xs">{t.vendorName ?? 'Unassigned'}</span>
    ),
  },
  {
    key: 'owner',
    header: 'Owner',
    render: (t) => (
      <span className="text-text-secondary text-xs">{t.ownerName ?? 'Unassigned'}</span>
    ),
  },
  {
    key: 'tier',
    header: 'Telemetry',
    render: (t) =>
      terminalsService.isConnectedTier(t.connectivity_tier) ? (
        <Badge tone="success">Connected</Badge>
      ) : t.connectivity_tier === 'sensor_augmented' ? (
        <Badge tone="primary">Sensor</Badge>
      ) : (
        <Badge tone="neutral">Listed</Badge>
      ),
  },
  {
    key: 'power',
    header: 'Power',
    align: 'right',
    render: (t) => (
      <span className="tabular-nums">
        {t.power_kw != null ? `${t.power_kw} kW` : '—'}
      </span>
    ),
  },
];

export default async function AdminChargersPage() {
  const { ctx } = await requireAdminDashboard();
  const chargers = await adminService.listNetworkChargers(ctx);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Network chargers"
        description={`${chargers.length} terminals across every vendor and owner.`}
      />
      <DataTable
        columns={columns}
        rows={chargers}
        getRowKey={(t) => t.id}
        emptyTitle="No chargers"
        emptyMessage="Terminals will appear here once seeded or registered."
      />
    </div>
  );
}
