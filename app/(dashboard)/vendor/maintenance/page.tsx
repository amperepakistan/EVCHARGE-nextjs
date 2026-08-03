import { AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type Column } from '@/components/ui/data-table';
import { getVendorScope } from '@/lib/mock/scope';
import { terminalById, terminalsForVendor } from '@/lib/mock/terminals';
import { mockMaintenance, mockParts, mockTeam } from '@/lib/mock/operations';
import type { MockMaintenanceJob, MockPart } from '@/lib/mock/types';

const jobColumns: Column<MockMaintenanceJob>[] = [
  {
    key: 'job',
    header: 'Job',
    render: (j) => (
      <div className="min-w-0">
        <p className="text-text-primary truncate font-semibold">{j.title}</p>
        <p className="text-text-secondary truncate text-xs">
          {j.id} · {terminalById(j.terminalId)?.name}
        </p>
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (j) => (
      <Badge
        tone={
          j.status === 'completed' ? 'success' : j.status === 'in_progress' ? 'warning' : 'neutral'
        }
      >
        {j.status.replace('_', ' ')}
      </Badge>
    ),
  },
  {
    key: 'date',
    header: 'Scheduled',
    render: (j) => <span className="text-text-secondary text-xs">{j.scheduledFor}</span>,
  },
  {
    key: 'tech',
    header: 'Technician',
    render: (j) => <span className="text-xs font-semibold">{j.technician}</span>,
  },
  {
    key: 'parts',
    header: 'Parts',
    align: 'right',
    render: (j) => (
      <span className="text-text-secondary font-mono text-xs">
        {j.partsUsed.length > 0 ? j.partsUsed.join(', ') : '—'}
      </span>
    ),
  },
];

const partColumns: Column<MockPart>[] = [
  {
    key: 'part',
    header: 'Part',
    render: (p) => (
      <div>
        <p className="text-text-primary font-semibold">{p.name}</p>
        <p className="text-text-secondary font-mono text-xs">{p.sku}</p>
      </div>
    ),
  },
  {
    key: 'stock',
    header: 'In stock',
    align: 'right',
    render: (p) => (
      <span
        className={`font-heading font-bold ${p.inStock <= p.reorderAt ? 'text-offline' : ''}`}
      >
        {p.inStock}
      </span>
    ),
  },
  {
    key: 'reorder',
    header: 'Reorder at',
    align: 'right',
    render: (p) => <span className="text-text-secondary tabular-nums">{p.reorderAt}</span>,
  },
];

export default async function VendorMaintenancePage() {
  const { vendorId } = await getVendorScope();
  const ids = terminalsForVendor(vendorId).map((t) => t.id);
  const jobs = mockMaintenance.filter((j) => ids.includes(j.terminalId));
  const technicians = mockTeam.filter((m) => m.role === 'Technician');
  const lowStock = mockParts.filter((p) => p.inStock <= p.reorderAt);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Maintenance"
        description="Scheduled visits, technician assignment and parts inventory."
        action={<Button size="sm">Schedule visit</Button>}
      />

      {lowStock.length > 0 ? (
        <Card variant="muted">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-occupied mt-0.5 size-5 shrink-0" />
            <div>
              <p className="text-text-primary text-sm font-semibold">
                {lowStock.length} part{lowStock.length === 1 ? '' : 's'} at or below reorder level
              </p>
              <p className="text-text-secondary mt-1 text-sm">
                {lowStock.map((p) => p.name).join(', ')}
              </p>
            </div>
          </div>
        </Card>
      ) : null}

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-bold tracking-tight">Jobs</h2>
        <DataTable
          columns={jobColumns}
          rows={jobs}
          getRowKey={(j) => j.id}
          emptyTitle="No maintenance scheduled"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <h2 className="font-heading text-lg font-bold tracking-tight">Parts inventory</h2>
          <DataTable columns={partColumns} rows={mockParts} getRowKey={(p) => p.sku} />
        </div>

        <div className="space-y-3">
          <h2 className="font-heading text-lg font-bold tracking-tight">Technicians</h2>
          <Card padded={false}>
            <ul className="divide-border divide-y">
              {technicians.map((tech) => {
                const load = jobs.filter(
                  (j) => j.technician === tech.name && j.status !== 'completed',
                ).length;
                return (
                  <li key={tech.id} className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="text-text-primary truncate text-sm font-semibold">
                        {tech.name}
                      </p>
                      <p className="text-text-secondary truncate text-xs">{tech.lastActive}</p>
                    </div>
                    <Badge tone={load > 0 ? 'warning' : 'neutral'}>
                      {load} open
                    </Badge>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      </section>
    </div>
  );
}
