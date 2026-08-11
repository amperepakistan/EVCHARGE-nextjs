import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { StatTile } from '@/components/ui/stat-tile';
import { Card } from '@/components/ui/card';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { StatusDot, STATUS_LABELS } from '@/components/ui/status-dot';
import { requireAdminDashboard } from '@/lib/server/dashboard';
import * as adminService from '@/lib/server/modules/admin/admin.service';
import type { TerminalStatus } from '@/types/database.types';

type TerminalRow = {
  id: string;
  name: string;
  city: string | null;
  status: TerminalStatus | 'unknown';
  connectivity_tier: string;
  charger_class: string | null;
  connector_type: string | null;
  power_kw: number | null;
};

const columns: Column<TerminalRow>[] = [
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
        <StatusDot status={t.status} />
        <span className="text-text-secondary text-xs">{STATUS_LABELS[t.status]}</span>
      </span>
    ),
  },
  {
    key: 'tier',
    header: 'Tier',
    render: (t) => (
      <Badge tone="neutral">{t.connectivity_tier.replace(/_/g, ' ')}</Badge>
    ),
  },
  {
    key: 'spec',
    header: 'Spec',
    align: 'right',
    render: (t) => (
      <span className="text-text-secondary text-xs">
        {[t.charger_class, t.connector_type, t.power_kw != null ? `${t.power_kw} kW` : null]
          .filter(Boolean)
          .join(' · ') || '—'}
      </span>
    ),
  },
];

export default async function AdminConsolePage() {
  const { ctx } = await requireAdminDashboard();
  const data = await adminService.getNetworkConsole(ctx);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin console"
        description="Network-wide view across every vendor, owner, and driver."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Terminals" value={data.terminalCount} variant="ink" />
        <StatTile label="Vendors" value={data.vendorCount} />
        <StatTile label="Owners" value={data.ownerCount} />
        <StatTile label="Drivers" value={data.driverCount} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Link
          href="/admin/drivers"
          className="border-border bg-surface hover:bg-surface-muted rounded-lg border p-4 transition-colors"
        >
          <p className="text-text-primary text-sm font-semibold">Manage drivers</p>
          <p className="text-text-secondary mt-1 text-xs">
            App registrations, vehicles, password and email reset
          </p>
        </Link>
        <Link
          href="/admin/vendors"
          className="border-border bg-surface hover:bg-surface-muted rounded-lg border p-4 transition-colors"
        >
          <p className="text-text-primary text-sm font-semibold">Open a vendor dashboard</p>
          <p className="text-text-secondary mt-1 text-xs">
            Full vendor controls for any installer account
          </p>
        </Link>
        <Link
          href="/admin/owners"
          className="border-border bg-surface hover:bg-surface-muted rounded-lg border p-4 transition-colors"
        >
          <p className="text-text-primary text-sm font-semibold">Open an owner dashboard</p>
          <p className="text-text-secondary mt-1 text-xs">
            Full site-owner controls for any hosting account
          </p>
        </Link>
        <Link
          href="/admin/notifications"
          className="border-border bg-surface hover:bg-surface-muted rounded-lg border p-4 transition-colors"
        >
          <p className="text-text-primary text-sm font-semibold">Send push notifications</p>
          <p className="text-text-secondary mt-1 text-xs">
            Broadcast to all drivers or selected accounts
          </p>
        </Link>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-lg font-bold tracking-tight">Recent terminals</h2>
          <Link
            href="/admin/chargers"
            className="text-text-secondary hover:text-text-primary inline-flex items-center gap-1 text-xs font-semibold"
          >
            View all
            <ChevronRight className="size-3.5" />
          </Link>
        </div>
        <DataTable
          columns={columns}
          rows={data.recentTerminals}
          getRowKey={(t) => t.id}
          emptyTitle="No terminals"
          emptyMessage="Seed or register terminals to populate the network."
        />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-lg font-bold tracking-tight">Tenants</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card padded={false}>
            <ul className="divide-border divide-y">
              {data.vendors.slice(0, 6).map((vendor) => (
                <li key={vendor.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="text-text-primary truncate text-sm font-semibold">
                      {vendor.name}
                    </p>
                    <p className="text-text-secondary truncate text-xs">
                      {vendor.contact_email ?? 'No email'}
                    </p>
                  </div>
                  <Badge tone="primary">{vendor.tier}</Badge>
                </li>
              ))}
              {data.vendors.length === 0 ? (
                <li className="text-text-secondary p-4 text-sm">No vendors yet</li>
              ) : null}
            </ul>
          </Card>
          <Card padded={false}>
            <ul className="divide-border divide-y">
              {data.owners.slice(0, 6).map((owner) => (
                <li key={owner.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="text-text-primary truncate text-sm font-semibold">
                      {owner.name}
                    </p>
                    <p className="text-text-secondary truncate text-xs">
                      {owner.contact_email ?? 'No email'}
                    </p>
                  </div>
                  <Badge tone="neutral">{owner.owner_type}</Badge>
                </li>
              ))}
              {data.owners.length === 0 ? (
                <li className="text-text-secondary p-4 text-sm">No owners yet</li>
              ) : null}
            </ul>
          </Card>
        </div>
      </section>
    </div>
  );
}
