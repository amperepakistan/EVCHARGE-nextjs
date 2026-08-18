import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { StatTile } from '@/components/ui/stat-tile';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { requireVendorDashboard, TenantAccessError } from '@/lib/server/dashboard';
import { TenantDenied } from '@/components/features/dashboard/tenant-denied';
import * as customersService from '@/lib/server/modules/customers/customers.service';
import type { DerivedCustomer } from '@/lib/server/modules/customers/customers.repository';

const columns: Column<DerivedCustomer>[] = [
  {
    key: 'customer',
    header: 'Customer',
    render: (c) => (
      <div className="min-w-0">
        <p className="text-text-primary truncate font-semibold">{c.businessName}</p>
        <p className="text-text-secondary truncate text-xs">
          {c.contactEmail ?? 'No email on file'}
        </p>
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Contract',
    render: () => <Badge tone="neutral">None</Badge>,
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
    render: () => <span className="text-text-secondary tabular-nums">OMR 0</span>,
  },
  {
    key: 'mrr',
    header: 'Monthly fee',
    align: 'right',
    render: () => <span className="font-heading font-bold tabular-nums">OMR 0</span>,
  },
  {
    key: 'go',
    header: '',
    align: 'right',
    render: (c) => (
      <Link
        href={`/vendor/customers/${c.id}`}
        className="text-text-secondary hover:text-text-primary inline-flex items-center gap-1 text-xs font-semibold"
      >
        View
        <ChevronRight className="size-3.5" />
      </Link>
    ),
  },
];

export default async function VendorCustomersPage() {
  try {
    const { ctx, scope } = await requireVendorDashboard();
    const customers = await customersService.listVendorCustomers(ctx, scope.vendorId);

    return (
      <div className="space-y-8">
        <PageHeader
          title="Customers"
          description="Site owners with terminals assigned to your vendor account. Contract fees will appear when CRM billing is added."
          action={<Button size="sm">Add customer</Button>}
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <StatTile
            label="Accounts"
            value={customers.length}
            hint="Derived from installed terminals"
            variant="ink"
          />
          <StatTile
            label="Monthly recurring"
            value="OMR 0"
            hint="Contract billing not configured"
            variant="primary"
          />
          <StatTile label="Install revenue" value="OMR 0" hint="Contract billing not configured" />
        </div>

        <DataTable
          columns={columns}
          rows={customers}
          getRowKey={(c) => c.id}
          emptyTitle="No customers yet"
          emptyMessage="Owners of terminals you operate will appear here."
        />
      </div>
    );
  } catch (err) {
    if (err instanceof TenantAccessError) {
      return <TenantDenied title="Customers" message={err.message} />;
    }
    throw err;
  }
}
