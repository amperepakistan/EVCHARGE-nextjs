import { PageHeader } from '@/components/ui/page-header';
import { StatTile } from '@/components/ui/stat-tile';
import { Card } from '@/components/ui/card';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { StatusDot, STATUS_LABELS } from '@/components/ui/status-dot';
import { isConnected, mockTerminals } from '@/lib/mock/terminals';
import { mockUsers } from '@/lib/mock/users';
import { mockFaults } from '@/lib/mock/operations';
import type { MockTerminal } from '@/lib/mock/types';

const columns: Column<MockTerminal>[] = [
  {
    key: 'name',
    header: 'Terminal',
    render: (t) => (
      <div className="min-w-0">
        <p className="text-text-primary truncate font-semibold">{t.name}</p>
        <p className="text-text-secondary truncate text-xs">{t.city}</p>
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (t) => (
      <span className="flex items-center gap-2">
        <StatusDot status={t.status ?? 'unknown'} />
        <span className="text-text-secondary text-xs">
          {STATUS_LABELS[t.status ?? 'unknown']}
        </span>
      </span>
    ),
  },
  {
    key: 'tier',
    header: 'Tier',
    render: (t) => (
      <Badge tone={isConnected(t.connectivityTier) ? 'success' : 'neutral'}>
        {t.connectivityTier.replace(/_/g, ' ')}
      </Badge>
    ),
  },
  {
    key: 'spec',
    header: 'Spec',
    align: 'right',
    render: (t) => (
      <span className="text-text-secondary text-xs">
        {t.chargerClass} · {t.connectorType} · {t.powerKw} kW
      </span>
    ),
  },
];

export default function AdminConsolePage() {
  const vendors = new Set(mockTerminals.map((t) => t.vendorId));
  const owners = new Set(mockTerminals.map((t) => t.ownerId));
  const openFaults = mockFaults.filter((f) => f.status !== 'resolved');

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin console"
        description="Network-wide view across every vendor and terminal owner."
      />

      <Card variant="muted">
        <p className="text-text-primary text-sm font-semibold">
          Placeholder console — not part of this MVP pass
        </p>
        <p className="text-text-secondary mt-1 text-sm">
          Vendor and Owner are the built-out dashboards. This page renders from the same mock
          layer so the route stays reachable and off Supabase.
        </p>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Terminals" value={mockTerminals.length} variant="ink" />
        <StatTile label="Vendors" value={vendors.size} />
        <StatTile label="Owners" value={owners.size} />
        <StatTile
          label="Open faults"
          value={openFaults.length}
          tone={openFaults.length > 0 ? 'danger' : 'default'}
        />
      </div>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-bold tracking-tight">All terminals</h2>
        <DataTable columns={columns} rows={mockTerminals} getRowKey={(t) => t.id} />
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-bold tracking-tight">Accounts</h2>
        <Card padded={false}>
          <ul className="divide-border divide-y">
            {mockUsers.map((user) => (
              <li key={user.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="text-text-primary truncate text-sm font-semibold">
                    {user.fullName}
                  </p>
                  <p className="text-text-secondary truncate text-xs">
                    {user.email} · {user.organisation}
                  </p>
                </div>
                <Badge tone="primary">{user.role.replace('_', ' ')}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
