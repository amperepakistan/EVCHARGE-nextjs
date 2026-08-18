import Link from 'next/link';
import { AlertTriangle, Handshake, PlugZap, ReceiptText, WifiOff, Zap } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { StatTile } from '@/components/ui/stat-tile';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusDot } from '@/components/ui/status-dot';
import { EmptyState } from '@/components/ui/empty-state';
import { SiteMapLoader } from '@/components/features/dashboard/site-map-loader';
import { getVendorScope } from '@/lib/mock/scope';
import { formatMoney } from '@/lib/screenshot-mode';
import { terminalById, terminalsForVendor } from '@/lib/mock/terminals';
import { mockFaults, mockHealth } from '@/lib/mock/operations';
import { customersForVendor } from '@/lib/mock/crm';
import type { FaultSeverity } from '@/lib/mock/types';

const SEVERITY_TONE: Record<FaultSeverity, 'danger' | 'warning' | 'neutral'> = {
  critical: 'danger',
  major: 'warning',
  minor: 'neutral',
};

const STATUS_COLOR: Record<string, string> = {
  available: '#4e9f3d',
  occupied: '#e0a11b',
  offline: '#c0483c',
  fault: '#c0483c',
  unknown: '#6c7364',
};

export default async function VendorOverviewPage() {
  const { vendorId } = await getVendorScope();
  const terminals = terminalsForVendor(vendorId);
  const ids = terminals.map((t) => t.id);

  const online = terminals.filter((t) => t.status && t.status !== 'offline').length;
  const offline = terminals.filter((t) => t.status === 'offline').length;
  const faulted = terminals.filter((t) => t.status === 'fault').length;
  const unknown = terminals.filter((t) => t.status === null).length;

  const activeFaults = mockFaults.filter(
    (f) => ids.includes(f.terminalId) && f.status !== 'resolved',
  );
  const needsAttention = mockHealth
    .filter((h) => ids.includes(h.terminalId) && h.healthScore < 80)
    .sort((a, b) => a.healthScore - b.healthScore);

  const customers = customersForVendor(vendorId);
  const activeCustomers = customers.filter((c) => c.contractStatus === 'active');
  const mrr = activeCustomers.reduce((sum, c) => sum + c.monthlyFee, 0);

  const connectedPct =
    terminals.length > 0
      ? Math.round(((terminals.length - unknown) / terminals.length) * 100)
      : 0;

  const pins = terminals.map((t) => ({
    id: t.id,
    latitude: t.latitude,
    longitude: t.longitude,
    label: t.name,
    sublabel: `${t.city} · ${t.chargerClass} ${t.connectorType}`,
    color: STATUS_COLOR[t.status ?? 'unknown'],
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Portfolio overview"
        description="Every charger your team installed and maintains, with the ones needing attention first."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Online"
          value={online}
          hint={`of ${terminals.length} installed`}
          icon={<Zap className="size-4.5" />}
          variant="ink"
        />
        <StatTile
          label="Offline"
          value={offline}
          hint={unknown > 0 ? `${unknown} not yet connected` : 'All reporting'}
          icon={<WifiOff className="size-4.5" />}
          tone={offline > 0 ? 'danger' : 'default'}
        />
        <StatTile
          label="Faulted"
          value={faulted}
          hint={`${activeFaults.length} open fault${activeFaults.length === 1 ? '' : 's'}`}
          icon={<AlertTriangle className="size-4.5" />}
          tone={faulted > 0 ? 'danger' : 'default'}
        />
        <StatTile
          label="Connected coverage"
          value={`${connectedPct}%`}
          hint={`${unknown} listed-tier charger${unknown === 1 ? '' : 's'} with no telemetry`}
          icon={<PlugZap className="size-4.5" />}
        />
      </div>

      {/* Your business: contract value with customers, not driver charging
          activity — that revenue belongs to the terminal owner. */}
      <div className="grid gap-3 sm:grid-cols-2">
        <StatTile
          label="Active customers"
          value={activeCustomers.length}
          hint={`of ${customers.length} accounts`}
          icon={<Handshake className="size-4.5" />}
          variant="primary"
        />
        <StatTile
          label="Monthly recurring"
          value={formatMoney(mrr)}
          hint="From maintenance contracts"
          icon={<ReceiptText className="size-4.5" />}
        />
      </div>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-base font-bold">Your locations</h2>
            <p className="text-text-secondary mt-1 text-sm">
              Every site you&rsquo;ve installed, coloured by live status.
            </p>
          </div>
          <Link
            href="/vendor/opportunities"
            className="text-primary-800 text-sm font-semibold hover:underline"
          >
            Find new sites
          </Link>
        </div>
        <div className="mt-4">
          <SiteMapLoader pins={pins} height={340} zoom={6} />
        </div>
      </Card>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="font-heading text-lg font-bold tracking-tight">Open faults</h2>
          <Card padded={false}>
            {activeFaults.length === 0 ? (
              <EmptyState title="No open faults" message="Every charger is reporting clean." />
            ) : (
              <ul className="divide-border divide-y">
                {activeFaults.map((fault) => (
                  <li key={fault.id} className="flex items-start gap-3 p-4">
                    <span className="bg-offline/10 text-offline rounded-image mt-0.5 flex size-9 shrink-0 items-center justify-center">
                      <AlertTriangle className="size-4.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-text-primary text-sm font-semibold">{fault.label}</p>
                        <Badge tone={SEVERITY_TONE[fault.severity]}>{fault.severity}</Badge>
                      </div>
                      <p className="text-text-secondary mt-0.5 truncate text-xs">
                        {terminalById(fault.terminalId)?.name} · {fault.detectedAt}
                      </p>
                      <p className="text-text-secondary mt-1 text-xs">
                        {fault.assignedTo ? `Assigned to ${fault.assignedTo}` : 'Unassigned'}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-3">
          <h2 className="font-heading text-lg font-bold tracking-tight">Needs attention</h2>
          <Card padded={false}>
            {needsAttention.length === 0 ? (
              <EmptyState title="All healthy" message="No charger is below an 80 health score." />
            ) : (
              <ul className="divide-border divide-y">
                {needsAttention.map((health) => {
                  const terminal = terminalById(health.terminalId);
                  return (
                    <li key={health.terminalId}>
                      <Link
                        href={`/vendor/chargers/${health.terminalId}`}
                        className="hover:bg-surface-muted/60 flex items-center gap-3 p-4 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <StatusDot status={terminal?.status ?? 'unknown'} />
                            <p className="text-text-primary truncate text-sm font-semibold">
                              {terminal?.name}
                            </p>
                          </div>
                          <p className="text-text-secondary mt-1 truncate text-xs">
                            {health.recommendations[0] ?? 'Scheduled service approaching'}
                          </p>
                        </div>
                        <span
                          className={`font-heading text-xl font-bold ${
                            health.healthScore < 60 ? 'text-offline' : 'text-occupied'
                          }`}
                        >
                          {health.healthScore}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}
