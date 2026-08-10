import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { requireAdminDashboard } from '@/lib/server/dashboard';
import * as adminService from '@/lib/server/modules/admin/admin.service';
import { enterVendorDashboardAction } from '@/lib/auth/admin-actions';

type VendorRow = Awaited<ReturnType<typeof adminService.listVendorsWithStats>>[number];

const columns: Column<VendorRow>[] = [
  {
    key: 'name',
    header: 'Vendor',
    render: (v) => (
      <div className="min-w-0">
        <p className="text-text-primary truncate font-semibold">{v.name}</p>
        <p className="text-text-secondary truncate text-xs">
          {v.contact_email ?? 'No email'}
        </p>
      </div>
    ),
  },
  {
    key: 'tier',
    header: 'Tier',
    render: (v) => <Badge tone="primary">{v.tier}</Badge>,
  },
  {
    key: 'terminals',
    header: 'Terminals',
    align: 'right',
    render: (v) => <span className="tabular-nums">{v.terminalCount}</span>,
  },
  {
    key: 'phone',
    header: 'Phone',
    render: (v) => (
      <span className="text-text-secondary text-xs">{v.contact_phone ?? '—'}</span>
    ),
  },
  {
    key: 'go',
    header: '',
    align: 'right',
    render: (v) => (
      <form action={enterVendorDashboardAction.bind(null, v.id)}>
        <Button type="submit" size="sm" variant="outline">
          Open dashboard
        </Button>
      </form>
    ),
  },
];

export default async function AdminVendorsPage() {
  const { ctx } = await requireAdminDashboard();
  const vendors = await adminService.listVendorsWithStats(ctx);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendors"
        description="Installer accounts across the network. Open a dashboard to use full vendor controls."
      />
      <DataTable
        columns={columns}
        rows={vendors}
        getRowKey={(v) => v.id}
        emptyTitle="No vendors"
        emptyMessage="Create vendor records to manage installer portfolios."
      />
    </div>
  );
}
