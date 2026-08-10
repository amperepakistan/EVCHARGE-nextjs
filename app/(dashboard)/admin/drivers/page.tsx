import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { requireAdminDashboard } from '@/lib/server/dashboard';
import * as driversAdmin from '@/lib/server/modules/admin/drivers-admin.service';
import type { AdminDriverListRow } from '@/lib/server/modules/admin/drivers-admin.repository';

const columns: Column<AdminDriverListRow>[] = [
  {
    key: 'driver',
    header: 'Driver',
    render: (d) => (
      <div className="min-w-0">
        <p className="text-text-primary truncate font-semibold">
          {d.fullName ?? 'Unnamed driver'}
        </p>
        <p className="text-text-secondary truncate text-xs">{d.email ?? 'No email'}</p>
      </div>
    ),
  },
  {
    key: 'vehicle',
    header: 'Vehicle',
    render: (d) => (
      <span className="text-text-secondary text-xs">
        {d.preferredVehicleKey ?? 'Not set'}
      </span>
    ),
  },
  {
    key: 'phone',
    header: 'Phone',
    render: (d) => (
      <span className="text-text-secondary text-xs">{d.phoneNumber ?? '—'}</span>
    ),
  },
  {
    key: 'sessions',
    header: 'Sessions',
    align: 'right',
    render: (d) => <span className="tabular-nums">{d.sessionCount}</span>,
  },
  {
    key: 'energy',
    header: 'Energy',
    align: 'right',
    render: (d) => (
      <span className="tabular-nums">{d.totalKwh.toFixed(1)} kWh</span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (d) =>
      d.isActive === false ? (
        <Badge tone="danger">Inactive</Badge>
      ) : (
        <Badge tone="success">Active</Badge>
      ),
  },
  {
    key: 'go',
    header: '',
    align: 'right',
    render: (d) => (
      <Link
        href={`/admin/drivers/${d.id}`}
        className="text-text-secondary hover:text-text-primary inline-flex items-center gap-1 text-xs font-semibold"
      >
        Manage
        <ChevronRight className="size-3.5" />
      </Link>
    ),
  },
];

export default async function AdminDriversPage() {
  const { ctx } = await requireAdminDashboard();
  const drivers = await driversAdmin.listDrivers(ctx);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Drivers"
        description={`${drivers.length} accounts registered through the Ampere app.`}
      />
      <DataTable
        columns={columns}
        rows={drivers}
        getRowKey={(d) => d.id}
        emptyTitle="No drivers yet"
        emptyMessage="Drivers appear here after they sign up in the mobile app."
      />
    </div>
  );
}
