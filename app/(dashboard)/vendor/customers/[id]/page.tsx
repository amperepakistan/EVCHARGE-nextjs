import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Building2, Mail, Phone } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusDot, STATUS_LABELS } from '@/components/ui/status-dot';
import { EmptyState } from '@/components/ui/empty-state';
import { requireVendorDashboard, TenantAccessError } from '@/lib/server/dashboard';
import { TenantDenied } from '@/components/features/dashboard/tenant-denied';
import * as customersService from '@/lib/server/modules/customers/customers.service';
import * as terminalsService from '@/lib/server/modules/terminals/terminals.service';
import { isAppError } from '@/lib/server/errors';

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    const { ctx, scope } = await requireVendorDashboard();
    const customer = await customersService.getVendorCustomer(ctx, scope.vendorId, id);
    const terminals = await customersService.listCustomerTerminals(
      ctx,
      scope.vendorId,
      customer.id,
    );
    const snapshots = await terminalsService.getLatestStatusByTerminalIds(
      ctx,
      terminals.map((t) => t.id),
    );

    return (
      <div className="space-y-8">
        <Link
          href="/vendor/customers"
          className="text-text-secondary hover:text-text-primary inline-flex items-center gap-1.5 text-sm font-semibold"
        >
          <ArrowLeft className="size-4" />
          All customers
        </Link>

        <PageHeader
          title={customer.businessName}
          description="Derived from terminals you operate for this owner."
          action={<Badge tone="neutral">No contract</Badge>}
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-1">
            <h2 className="font-heading text-lg font-bold tracking-tight">Contract</h2>
            <Card>
              <dl className="space-y-3 text-sm">
                <Row label="Install fee" value="OMR 0" />
                <Row label="Monthly fee" value="OMR 0" />
                <Row label="Terminals" value={String(customer.terminalCount)} />
              </dl>
              <p className="text-text-secondary mt-4 text-xs">
                Fees stay at zero until a CRM contracts schema is added.
              </p>
            </Card>

            <Card>
              <h3 className="text-text-secondary text-xs font-bold tracking-wide uppercase">
                Contact
              </h3>
              <div className="mt-3 space-y-2.5 text-sm">
                <div className="flex items-center gap-2.5">
                  <Building2 className="text-text-secondary size-4 shrink-0" />
                  <span className="min-w-0 truncate">{customer.contactName}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="text-text-secondary size-4 shrink-0" />
                  <span className="min-w-0 truncate">
                    {customer.contactEmail ?? '—'}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="text-text-secondary size-4 shrink-0" />
                  <span>{customer.contactPhone ?? '—'}</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-3 lg:col-span-2">
            <h2 className="font-heading text-lg font-bold tracking-tight">
              Installed terminals
            </h2>
            <Card padded={false}>
              {terminals.length === 0 ? (
                <EmptyState
                  title="No terminals"
                  message="No terminals recorded for this account under your vendor."
                />
              ) : (
                <ul className="divide-border divide-y">
                  {terminals.map((terminal) => {
                    const status = snapshots.get(terminal.id)?.status ?? 'unknown';
                    return (
                      <li key={terminal.id} className="flex items-center gap-3 p-4">
                        <StatusDot status={status} />
                        <div className="min-w-0 flex-1">
                          <p className="text-text-primary truncate text-sm font-semibold">
                            {terminal.name}
                          </p>
                          <p className="text-text-secondary truncate text-xs">
                            {[terminal.city, terminal.charger_class, terminal.connector_type]
                              .filter(Boolean)
                              .join(' · ')}
                          </p>
                        </div>
                        <span className="text-text-secondary text-xs">
                          {STATUS_LABELS[status]}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </div>
        </div>
      </div>
    );
  } catch (err) {
    if (err instanceof TenantAccessError) {
      return <TenantDenied title="Customer" message={err.message} />;
    }
    if (isAppError(err) && err.status === 404) {
      notFound();
    }
    throw err;
  }
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-text-secondary">{label}</dt>
      <dd className="text-text-primary text-right font-semibold">{value}</dd>
    </div>
  );
}
