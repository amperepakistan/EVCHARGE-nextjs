import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { StatusDot, STATUS_LABELS } from '@/components/ui/status-dot';
import { requireVendorDashboard, TenantAccessError } from '@/lib/server/dashboard';
import { TenantDenied } from '@/components/features/dashboard/tenant-denied';
import * as terminalsService from '@/lib/server/modules/terminals/terminals.service';
import type { TerminalStatus } from '@/types/database.types';

type ChargerRow = {
  id: string;
  name: string;
  city: string | null;
  chargerClass: string | null;
  connectorType: string | null;
  connectivityTier: string;
  powerKw: number | null;
  status: TerminalStatus | 'unknown';
  lastSeen: string | null;
};

const columns: Column<ChargerRow>[] = [
  {
    key: 'name',
    header: 'Charger',
    render: (t) => (
      <div className="min-w-0">
        <p className="text-text-primary truncate font-semibold">{t.name}</p>
        <p className="text-text-secondary truncate text-xs">
          {[t.city, t.chargerClass, t.connectorType].filter(Boolean).join(' · ')}
        </p>
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
    key: 'tier',
    header: 'Telemetry',
    render: (t) =>
      terminalsService.isConnectedTier(t.connectivityTier) ? (
        <Badge tone="success">Connected</Badge>
      ) : t.connectivityTier === 'sensor_augmented' ? (
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
        {t.powerKw != null ? `${t.powerKw} kW` : '—'}
      </span>
    ),
  },
  {
    key: 'heartbeat',
    header: 'Last seen',
    align: 'right',
    render: (t) => (
      <span className="text-text-secondary text-xs">{t.lastSeen ?? 'Never'}</span>
    ),
  },
  {
    key: 'go',
    header: '',
    align: 'right',
    render: (t) => (
      <Link
        href={`/vendor/chargers/${t.id}`}
        className="text-text-secondary hover:text-text-primary inline-flex items-center gap-1 text-xs font-semibold"
      >
        Manage
        <ChevronRight className="size-3.5" />
      </Link>
    ),
  },
];

export default async function VendorChargersPage() {
  try {
    const { ctx, scope } = await requireVendorDashboard();
    const terminals = await terminalsService.listTerminalsForVendor(ctx, scope.vendorId);
    const snapshots = await terminalsService.getLatestStatusByTerminalIds(
      ctx,
      terminals.map((t) => t.id),
    );

    const rows: ChargerRow[] = terminals.map((t) => {
      const snap = snapshots.get(t.id);
      return {
        id: t.id,
        name: t.name,
        city: t.city,
        chargerClass: t.charger_class,
        connectorType: t.connector_type,
        connectivityTier: t.connectivity_tier,
        powerKw: t.power_kw,
        status: snap?.status ?? 'unknown',
        lastSeen: snap?.recorded_at
          ? new Date(snap.recorded_at).toLocaleString()
          : null,
      };
    });

    return (
      <div className="space-y-6">
        <PageHeader
          title="Chargers"
          description={`${rows.length} units registered to your vendor account.`}
        />
        <DataTable
          columns={columns}
          rows={rows}
          getRowKey={(t) => t.id}
          emptyTitle="No chargers registered"
          emptyMessage="Register your first charger to start monitoring it."
        />
      </div>
    );
  } catch (err) {
    if (err instanceof TenantAccessError) {
      return <TenantDenied title="Chargers" message={err.message} />;
    }
    throw err;
  }
}
