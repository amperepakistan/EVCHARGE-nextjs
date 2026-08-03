import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { StatTile } from '@/components/ui/stat-tile';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
        <p className="text-text-primary truncate font-semibold">{c.contactName}</p>
        <p className="text-text-secondary truncate text-xs">{c.contactEmail}</p>
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Contract',
    render: (c) => <Badge tone={STATUS_TONE[c.contractStatus]}>{c.contractStatus}</Badge>,
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
        Rs {c.monthlyFee.toLocaleString()}
      </span>
    ),
  },
  {
    key: 'since',
    header: 'Since',
    align: 'right',
    render: (c) => <span className="text-text-secondary text-xs">{c.contractStartedAt}</span>,
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
  const { vendorId } = await getVendorScope();
  const customers = customersForVendor(vendorId);

  const active = customers.filter((c) => c.contractStatus === 'active');
  const mrr = active.reduce((sum, c) => sum + c.monthlyFee, 0);
  const totalInstalls = customers.reduce((sum, c) => sum + c.installFee, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Customers"
        description="The terminal owners you've sold and installed for — contract value, not driver activity."
        action={<Button size="sm">Add customer</Button>}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile
          label="Active accounts"
          value={active.length}
          hint={`of ${customers.length} total`}
          variant="ink"
        />
        <StatTile
          label="Monthly recurring"
          value={`Rs ${mrr.toLocaleString()}`}
          hint="From active maintenance contracts"
          variant="primary"
        />
        <StatTile
          label="Install revenue"
          value={`Rs ${totalInstalls.toLocaleString()}`}
          hint="Lifetime one-time fees"
        />
      </div>

      <DataTable
        columns={columns}
        rows={customers}
        getRowKey={(c) => c.id}
        emptyTitle="No customers yet"
        emptyMessage="Accounts you install and maintain terminals for will appear here."
      />
    </div>
  );
}
