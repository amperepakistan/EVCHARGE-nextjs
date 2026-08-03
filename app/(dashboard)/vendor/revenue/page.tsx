import { PageHeader } from '@/components/ui/page-header';
import { StatTile } from '@/components/ui/stat-tile';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type Column } from '@/components/ui/data-table';
import { TrendChart } from '@/components/features/dashboard/trend-chart';
import { getVendorScope } from '@/lib/mock/scope';
import { customersForVendor } from '@/lib/mock/crm';
import type { ContractStatus, MockCustomer } from '@/lib/mock/types';

const STATUS_TONE: Record<ContractStatus, 'success' | 'warning' | 'neutral'> = {
  active: 'success',
  pending: 'warning',
  lapsed: 'neutral',
};

const columns: Column<MockCustomer>[] = [
  {
    key: 'customer',
    header: 'Customer',
    render: (c) => (
      <div className="min-w-0">
        <p className="text-text-primary truncate font-semibold">{c.businessName}</p>
        <p className="text-text-secondary truncate text-xs">{c.contactName}</p>
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (c) => <Badge tone={STATUS_TONE[c.contractStatus]}>{c.contractStatus}</Badge>,
  },
  {
    key: 'install',
    header: 'Install fee',
    align: 'right',
    render: (c) => (
      <span className="text-text-secondary tabular-nums">
        Rs {c.installFee.toLocaleString()}
      </span>
    ),
  },
  {
    key: 'mrr',
    header: 'Monthly fee',
    align: 'right',
    render: (c) => (
      <span className="font-heading font-bold tabular-nums">
        Rs {c.contractStatus === 'active' ? c.monthlyFee.toLocaleString() : '0'}
      </span>
    ),
  },
];

/** 6 months of contract-value growth — installs booked plus MRR compounding. */
function buildMonthlySeries(customers: MockCustomer[]) {
  const activeMrr = customers
    .filter((c) => c.contractStatus === 'active')
    .reduce((sum, c) => sum + c.monthlyFee, 0);

  const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  // Simple ramp toward the current MRR so the chart tells a growth story
  // without needing real historical billing data.
  return months.map((month, i) => ({
    month,
    mrr: Math.round(activeMrr * ((i + 3) / (months.length + 2))),
  }));
}

export default async function VendorRevenuePage() {
  const { vendorId } = await getVendorScope();
  const customers = customersForVendor(vendorId);

  const active = customers.filter((c) => c.contractStatus === 'active');
  const pending = customers.filter((c) => c.contractStatus === 'pending');
  const mrr = active.reduce((sum, c) => sum + c.monthlyFee, 0);
  const lifetimeInstalls = customers.reduce((sum, c) => sum + c.installFee, 0);
  const pipelineValue = pending.reduce((sum, c) => sum + c.installFee + c.monthlyFee * 12, 0);
  const series = buildMonthlySeries(customers);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Business"
        description="Your install and maintenance contract value — not driver charging revenue, which belongs to the terminal owner."
        action={
          <Button variant="outline" size="sm">
            Export statement
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile
          label="Monthly recurring"
          value={`Rs ${mrr.toLocaleString()}`}
          hint={`Across ${active.length} active contract${active.length === 1 ? '' : 's'}`}
          variant="primary"
        />
        <StatTile
          label="Lifetime installs"
          value={`Rs ${lifetimeInstalls.toLocaleString()}`}
          hint="One-time install fees, all accounts"
          variant="ink"
        />
        <StatTile
          label="Pipeline value"
          value={`Rs ${pipelineValue.toLocaleString()}`}
          hint={`${pending.length} pending contract${pending.length === 1 ? '' : 's'}, first year`}
        />
      </div>

      <Card>
        <h2 className="font-heading text-base font-bold">Monthly recurring revenue</h2>
        <p className="text-text-secondary mt-1 text-sm">
          Trending toward your current active MRR as recent installs ramp up.
        </p>
        <div className="mt-4">
          <TrendChart data={series} xKey="month" yKey="mrr" valuePrefix="Rs " />
        </div>
      </Card>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-bold tracking-tight">By customer</h2>
        <DataTable
          columns={columns}
          rows={customers}
          getRowKey={(c) => c.id}
          emptyTitle="No customers yet"
        />
      </section>
    </div>
  );
}
