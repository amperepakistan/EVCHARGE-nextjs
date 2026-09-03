import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { DeletionRequestActions } from '@/components/features/admin/deletion-request-actions';
import { requireAdminDashboard } from '@/lib/server/dashboard';
import * as accountDeletion from '@/lib/server/modules/account-deletion/account-deletion.service';
import type { DeletionRequestAdminRow } from '@/lib/server/modules/account-deletion/account-deletion.repository';

const columns: Column<DeletionRequestAdminRow>[] = [
  {
    key: 'driver',
    header: 'Driver',
    render: (r) => (
      <div className="min-w-0">
        <p className="text-text-primary truncate font-semibold">
          {r.fullName ?? 'Unnamed driver'}
        </p>
        <p className="text-text-secondary truncate text-xs">
          {r.phoneNumber ?? r.email ?? r.userId.slice(0, 8)}
        </p>
      </div>
    ),
  },
  {
    key: 'reason',
    header: 'Reason',
    render: (r) => (
      <span className="text-text-secondary text-xs">{r.reason?.trim() || '—'}</span>
    ),
  },
  {
    key: 'requested',
    header: 'Requested',
    render: (r) => (
      <span className="text-text-secondary text-xs">
        {new Date(r.createdAt).toLocaleString()}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Account',
    render: (r) =>
      r.isActive === false ? (
        <Badge tone="danger">Inactive</Badge>
      ) : (
        <Badge tone="success">Active</Badge>
      ),
  },
  {
    key: 'actions',
    header: '',
    align: 'right',
    render: (r) => <DeletionRequestActions requestId={r.id} />,
  },
];

export default async function AdminDeletionRequestsPage() {
  const { ctx } = await requireAdminDashboard();
  const requests = await accountDeletion.listPendingRequests(ctx);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Account deletion requests"
        description="Approve to scrub personal data and deactivate the account. Reject leaves the account unchanged."
      />

      {requests.length === 0 ? (
        <p className="text-text-secondary text-sm">No pending deletion requests.</p>
      ) : (
        <DataTable
          columns={columns}
          rows={requests}
          getRowKey={(r) => r.id}
          emptyTitle="No pending requests"
        />
      )}
    </div>
  );
}
