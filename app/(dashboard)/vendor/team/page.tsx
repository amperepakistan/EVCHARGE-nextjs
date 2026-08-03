import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type Column } from '@/components/ui/data-table';
import { mockTeam } from '@/lib/mock/operations';
import type { MockTeamMember, VendorTeamRole } from '@/lib/mock/types';

/** Sub-roles are vendor-side only — see docs/feature-roles.md §8. */
const ROLE_SCOPE: Record<VendorTeamRole, string> = {
  Operator: 'Day-to-day monitoring and remote start/stop',
  'Station Manager': 'Full site control, pricing and team scheduling',
  Technician: 'Fault tickets, diagnostics and maintenance jobs',
  Finance: 'Revenue, invoices and exports',
  'Support Agent': 'Driver enquiries and session lookups',
};

const columns: Column<MockTeamMember>[] = [
  {
    key: 'member',
    header: 'Member',
    render: (m) => (
      <div className="flex items-center gap-3">
        <span className="bg-surface-muted text-text-secondary flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold">
          {m.name
            .split(' ')
            .map((n) => n[0])
            .join('')}
        </span>
        <div className="min-w-0">
          <p className="text-text-primary truncate font-semibold">{m.name}</p>
          <p className="text-text-secondary truncate text-xs">{m.email}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'role',
    header: 'Role',
    render: (m) => <Badge tone="primary">{m.role}</Badge>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (m) => (
      <Badge tone={m.active ? 'success' : 'neutral'}>{m.active ? 'Active' : 'Disabled'}</Badge>
    ),
  },
  {
    key: 'seen',
    header: 'Last active',
    align: 'right',
    render: (m) => <span className="text-text-secondary text-xs">{m.lastActive}</span>,
  },
];

export default function VendorTeamPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Team"
        description="People in your vendor account and what each role can do."
        action={<Button size="sm">Invite member</Button>}
      />

      <DataTable columns={columns} rows={mockTeam} getRowKey={(m) => m.id} />

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-bold tracking-tight">Role permissions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(ROLE_SCOPE) as VendorTeamRole[]).map((role) => (
            <Card key={role}>
              <h3 className="font-heading text-sm font-bold">{role}</h3>
              <p className="text-text-secondary mt-1.5 text-sm leading-relaxed">
                {ROLE_SCOPE[role]}
              </p>
              <p className="text-text-secondary mt-3 text-xs">
                {mockTeam.filter((m) => m.role === role).length} assigned
              </p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
