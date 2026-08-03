import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Building2, Mail, Phone } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusDot, STATUS_LABELS } from '@/components/ui/status-dot';
import { customerById } from '@/lib/mock/crm';
import { terminalsForOwner } from '@/lib/mock/terminals';
import { healthFor } from '@/lib/mock/operations';
import type { ContractStatus } from '@/lib/mock/types';

const STATUS_TONE: Record<ContractStatus, 'success' | 'warning' | 'neutral'> = {
  active: 'success',
  pending: 'warning',
  lapsed: 'neutral',
};

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = customerById(id);
  if (!customer) notFound();

  const terminals = terminalsForOwner(customer.ownerId);
  const avgHealth =
    terminals.length > 0
      ? Math.round(
          terminals.reduce((sum, t) => sum + (healthFor(t.id)?.healthScore ?? 100), 0) /
            terminals.length,
        )
      : null;

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
        description={customer.notes}
        action={<Badge tone={STATUS_TONE[customer.contractStatus]}>{customer.contractStatus}</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-1">
          <h2 className="font-heading text-lg font-bold tracking-tight">Contract</h2>
          <Card>
            <dl className="space-y-3 text-sm">
              <Row label="Install fee" value={`Rs ${customer.installFee.toLocaleString()}`} />
              <Row label="Monthly fee" value={`Rs ${customer.monthlyFee.toLocaleString()}`} />
              <Row label="Started" value={customer.contractStartedAt} />
              <Row label="Terminals" value={String(customer.terminalCount)} />
              {avgHealth !== null ? (
                <Row
                  label="Avg. health"
                  value={String(avgHealth)}
                  valueClassName={
                    avgHealth >= 80
                      ? 'text-available'
                      : avgHealth >= 60
                        ? 'text-occupied'
                        : 'text-offline'
                  }
                />
              ) : null}
            </dl>
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
                <span className="min-w-0 truncate">{customer.contactEmail}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="text-text-secondary size-4 shrink-0" />
                <span>{customer.contactPhone}</span>
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
              <p className="text-text-secondary p-4 text-sm">
                No terminals recorded for this account yet.
              </p>
            ) : (
              <ul className="divide-border divide-y">
                {terminals.map((terminal) => (
                  <li key={terminal.id} className="flex items-center gap-3 p-4">
                    <StatusDot status={terminal.status ?? 'unknown'} />
                    <div className="min-w-0 flex-1">
                      <p className="text-text-primary truncate text-sm font-semibold">
                        {terminal.name}
                      </p>
                      <p className="text-text-secondary truncate text-xs">
                        {terminal.city} · {terminal.chargerClass} · {terminal.connectorType}
                      </p>
                    </div>
                    <span className="text-text-secondary text-xs">
                      {STATUS_LABELS[terminal.status ?? 'unknown']}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  valueClassName = '',
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-text-secondary">{label}</dt>
      <dd className={`text-text-primary text-right font-semibold ${valueClassName}`}>{value}</dd>
    </div>
  );
}
