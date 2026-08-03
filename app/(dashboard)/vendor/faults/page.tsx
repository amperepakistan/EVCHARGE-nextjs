import { PageHeader } from '@/components/ui/page-header';
import { StatTile } from '@/components/ui/stat-tile';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getVendorScope } from '@/lib/mock/scope';
import { terminalById, terminalsForVendor } from '@/lib/mock/terminals';
import { mockFaults } from '@/lib/mock/operations';
import type { FaultSeverity, FaultStatus, MockFault } from '@/lib/mock/types';

const SEVERITY_TONE: Record<FaultSeverity, 'danger' | 'warning' | 'neutral'> = {
  critical: 'danger',
  major: 'warning',
  minor: 'neutral',
};

const STATUS_TONE: Record<FaultStatus, 'danger' | 'warning' | 'success'> = {
  active: 'danger',
  acknowledged: 'warning',
  resolved: 'success',
};

const columns: Column<MockFault>[] = [
  {
    key: 'fault',
    header: 'Fault',
    render: (f) => (
      <div className="min-w-0">
        <p className="text-text-primary truncate font-semibold">{f.label}</p>
        <p className="text-text-secondary truncate font-mono text-xs">{f.code}</p>
      </div>
    ),
  },
  {
    key: 'charger',
    header: 'Charger',
    render: (f) => (
      <span className="text-text-secondary text-xs">{terminalById(f.terminalId)?.name}</span>
    ),
  },
  {
    key: 'severity',
    header: 'Severity',
    render: (f) => <Badge tone={SEVERITY_TONE[f.severity]}>{f.severity}</Badge>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (f) => <Badge tone={STATUS_TONE[f.status]}>{f.status}</Badge>,
  },
  {
    key: 'detected',
    header: 'Detected',
    render: (f) => <span className="text-text-secondary text-xs">{f.detectedAt}</span>,
  },
  {
    key: 'assignee',
    header: 'Technician',
    render: (f) =>
      f.assignedTo ? (
        <span className="text-xs font-semibold">{f.assignedTo}</span>
      ) : (
        <span className="text-text-secondary text-xs">Unassigned</span>
      ),
  },
  {
    key: 'ticket',
    header: 'Ticket',
    align: 'right',
    render: (f) =>
      f.ticketId ? (
        <span className="font-mono text-xs">{f.ticketId}</span>
      ) : (
        <Button variant="outline" size="sm">
          Create ticket
        </Button>
      ),
  },
];

export default async function VendorFaultsPage() {
  const { vendorId } = await getVendorScope();
  const ids = terminalsForVendor(vendorId).map((t) => t.id);
  const faults = mockFaults.filter((f) => ids.includes(f.terminalId));

  const active = faults.filter((f) => f.status === 'active');
  const critical = active.filter((f) => f.severity === 'critical');
  const unassigned = active.filter((f) => !f.assignedTo);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fault management"
        description="Live alerts from your chargers. Create a ticket to dispatch a technician."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile
          label="Active"
          value={active.length}
          hint="Not yet resolved"
          tone={active.length > 0 ? 'danger' : 'default'}
        />
        <StatTile
          label="Critical"
          value={critical.length}
          hint="Charger out of service"
          variant="ink"
        />
        <StatTile
          label="Unassigned"
          value={unassigned.length}
          hint="Needs a technician"
          tone={unassigned.length > 0 ? 'warning' : 'default'}
        />
      </div>

      <DataTable
        columns={columns}
        rows={faults}
        getRowKey={(f) => f.id}
        emptyTitle="No faults recorded"
        emptyMessage="Your chargers have not reported any faults."
      />
    </div>
  );
}
