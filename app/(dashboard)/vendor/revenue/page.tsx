import { PageHeader } from '@/components/ui/page-header';
import { StatTile } from '@/components/ui/stat-tile';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type Column } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { requireVendorDashboard, TenantAccessError } from '@/lib/server/dashboard';
import { TenantDenied } from '@/components/features/dashboard/tenant-denied';
import * as customersService from '@/lib/server/modules/customers/customers.service';
import * as terminalsService from '@/lib/server/modules/terminals/terminals.service';
import type { DerivedCustomer } from '@/lib/server/modules/customers/customers.repository';

const columns: Column<DerivedCustomer>[] = [
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
    render: () => <Badge tone="neutral">No contract</Badge>,
  },
  {
    key: 'terminals',
    header: 'Terminals',
    align: 'right',
    render: (c) => <span className="tabular-nums">{c.terminalCount}</span>,
  },
  {
    key: 'install',
    header: 'Install fee',
    align: 'right',
    render: () => <span className="text-text-secondary tabular-nums">Rs 0</span>,
  },
  {
    key: 'mrr',
    header: 'Monthly fee',
    align: 'right',
    render: () => <span className="font-heading font-bold tabular-nums">Rs 0</span>,
  },
];

export default async function VendorRevenuePage() {
  try {
    const { ctx, scope } = await requireVendorDashboard();
    const [customers, terminals] = await Promise.all([
      customersService.listVendorCustomers(ctx, scope.vendorId),
      terminalsService.listTerminalsForVendor(ctx, scope.vendorId),
    ]);

    return (
      <div className="space-y-8">
        <PageHeader
          title="Business"
          description="Install and maintenance contract value — not driver charging revenue. Fees stay at zero until CRM billing exists."
          action={
            <Button variant="outline" size="sm">
              Export statement
            </Button>
          }
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <StatTile
            label="Customers"
            value={customers.length}
            hint="Owners of your terminals"
            variant="ink"
          />
          <StatTile
            label="Terminals"
            value={terminals.length}
            hint="Assigned to your vendor account"
            variant="primary"
          />
          <StatTile label="Monthly recurring" value="Rs 0" hint="Contract billing coming soon" />
        </div>

        <Card padded={false}>
          <EmptyState
            title="Contract billing coming soon"
            message="MRR charts will appear when customers/contracts are modelled. No synthetic revenue is shown."
          />
        </Card>

        <section className="space-y-3">
          <h2 className="font-heading text-lg font-bold tracking-tight">By customer</h2>
          <DataTable
            columns={columns}
            rows={customers}
            getRowKey={(c) => c.id}
            emptyTitle="No customers yet"
            emptyMessage="Owners of terminals you operate will appear here."
          />
        </section>
      </div>
    );
  } catch (err) {
    if (err instanceof TenantAccessError) {
      return <TenantDenied title="Business" message={err.message} />;
    }
    throw err;
  }
}
