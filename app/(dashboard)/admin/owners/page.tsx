import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { requireAdminDashboard } from '@/lib/server/dashboard';
import * as adminService from '@/lib/server/modules/admin/admin.service';
import { enterOwnerDashboardAction } from '@/lib/auth/admin-actions';

type OwnerRow = Awaited<ReturnType<typeof adminService.listOwnersWithStats>>[number];

const columns: Column<OwnerRow>[] = [
  {
    key: 'name',
    header: 'Owner',
    render: (o) => (
      <div className="min-w-0">
        <p className="text-text-primary truncate font-semibold">{o.name}</p>
        <p className="text-text-secondary truncate text-xs">
          {o.contact_email ?? 'No email'}
        </p>
      </div>
    ),
  },
  {
    key: 'type',
    header: 'Type',
    render: (o) => <Badge tone="neutral">{o.owner_type}</Badge>,
  },
  {
    key: 'terminals',
    header: 'Sites',
    align: 'right',
    render: (o) => <span className="tabular-nums">{o.terminalCount}</span>,
  },
  {
    key: 'phone',
    header: 'Phone',
    render: (o) => (
      <span className="text-text-secondary text-xs">{o.contact_phone ?? '—'}</span>
    ),
  },
  {
    key: 'go',
    header: '',
    align: 'right',
    render: (o) => (
      <form action={enterOwnerDashboardAction.bind(null, o.id)}>
        <Button type="submit" size="sm" variant="outline">
          Open dashboard
        </Button>
      </form>
    ),
  },
];

export default async function AdminOwnersPage() {
  const { ctx } = await requireAdminDashboard();
  const owners = await adminService.listOwnersWithStats(ctx);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Owners"
        description="Site-hosting accounts across the network. Open a dashboard to use full owner controls."
      />
      <DataTable
        columns={columns}
        rows={owners}
        getRowKey={(o) => o.id}
        emptyTitle="No owners"
        emptyMessage="Create owner records to manage site host accounts."
      />
    </div>
  );
}
