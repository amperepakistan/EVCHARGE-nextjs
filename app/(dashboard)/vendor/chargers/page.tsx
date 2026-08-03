import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { StatusDot, STATUS_LABELS } from '@/components/ui/status-dot';
import { getVendorScope } from '@/lib/mock/scope';
import { isConnected, terminalsForVendor } from '@/lib/mock/terminals';
import { healthFor } from '@/lib/mock/operations';
import type { MockTerminal } from '@/lib/mock/types';

const columns: Column<MockTerminal>[] = [
  {
    key: 'name',
    header: 'Charger',
    render: (t) => (
      <div className="min-w-0">
        <p className="text-text-primary truncate font-semibold">{t.name}</p>
        <p className="text-text-secondary truncate text-xs">
          {t.city} · {t.chargerClass} · {t.connectorType}
        </p>
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (t) => (
      <span className="flex items-center gap-2 whitespace-nowrap">
        <StatusDot status={t.status ?? 'unknown'} />
        <span className="text-text-secondary text-xs font-semibold">
          {STATUS_LABELS[t.status ?? 'unknown']}
        </span>
      </span>
    ),
  },
  {
    key: 'tier',
    header: 'Telemetry',
    render: (t) =>
      isConnected(t.connectivityTier) ? (
        <Badge tone="success">Connected</Badge>
      ) : t.connectivityTier === 'sensor_augmented' ? (
        <Badge tone="primary">Sensor</Badge>
      ) : (
        <Badge tone="neutral">Listed</Badge>
      ),
  },
  {
    key: 'health',
    header: 'Health',
    align: 'right',
    render: (t) => {
      const health = healthFor(t.id);
      if (!health) return <span className="text-text-secondary text-xs">—</span>;
      const tone =
        health.healthScore >= 80
          ? 'text-available'
          : health.healthScore >= 60
            ? 'text-occupied'
            : 'text-offline';
      return <span className={`font-heading font-bold ${tone}`}>{health.healthScore}</span>;
    },
  },
  {
    key: 'power',
    header: 'Power',
    align: 'right',
    render: (t) => <span className="tabular-nums">{t.powerKw} kW</span>,
  },
  {
    key: 'heartbeat',
    header: 'Last seen',
    align: 'right',
    render: (t) => (
      <span className="text-text-secondary text-xs">
        {healthFor(t.id)?.lastHeartbeat ?? 'Never'}
      </span>
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
  const { vendorId } = await getVendorScope();
  const terminals = terminalsForVendor(vendorId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chargers"
        description={`${terminals.length} units registered to your vendor account.`}
      />
      <DataTable
        columns={columns}
        rows={terminals}
        getRowKey={(t) => t.id}
        emptyTitle="No chargers registered"
        emptyMessage="Register your first charger to start monitoring it."
      />
    </div>
  );
}
