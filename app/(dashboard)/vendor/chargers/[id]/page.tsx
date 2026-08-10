import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Lock,
  Power,
  QrCode,
  RadioTower,
  RefreshCw,
  ShieldAlert,
  Square,
  Unlock,
  Zap,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusDot, STATUS_LABELS } from '@/components/ui/status-dot';
import { requireVendorDashboard, TenantAccessError } from '@/lib/server/dashboard';
import { TenantDenied } from '@/components/features/dashboard/tenant-denied';
import * as terminalsService from '@/lib/server/modules/terminals/terminals.service';
import { isAppError } from '@/lib/server/errors';

const REMOTE_OPS = [
  { label: 'Start', icon: Zap },
  { label: 'Stop', icon: Square },
  { label: 'Reset', icon: RefreshCw },
  { label: 'Lock', icon: Lock },
  { label: 'Unlock', icon: Unlock },
  { label: 'Disable', icon: Power },
];

export default async function ChargerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    const { ctx, scope } = await requireVendorDashboard();
    const terminal = await terminalsService.getTerminalForVendor(ctx, scope.vendorId, id);
    const snapshots = await terminalsService.getLatestStatusByTerminalIds(ctx, [terminal.id]);
    const snap = snapshots.get(terminal.id);
    const status = snap?.status ?? 'unknown';
    const connected = terminalsService.isConnectedTier(terminal.connectivity_tier);

    return (
      <div className="space-y-8">
        <Link
          href="/vendor/chargers"
          className="text-text-secondary hover:text-text-primary inline-flex items-center gap-1.5 text-sm font-semibold"
        >
          <ArrowLeft className="size-4" />
          All chargers
        </Link>

        <PageHeader
          title={terminal.name}
          description={`${[terminal.address, terminal.city].filter(Boolean).join(', ') || 'Location not set'}`}
          action={
            <>
              <Badge tone={connected ? 'success' : 'neutral'}>
                {connected ? 'Connected' : 'Listed'}
              </Badge>
              <span className="border-border rounded-tag flex items-center gap-2 border px-2.5 py-1">
                <StatusDot status={status} />
                <span className="text-xs font-bold">{STATUS_LABELS[status]}</span>
              </span>
            </>
          }
        />

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-heading text-base font-bold">Remote operations</h2>
              <p className="text-text-secondary mt-1 text-sm">
                {connected
                  ? 'Commands will be delivered over OCPP once the gateway is live.'
                  : 'This charger has no live link, so remote commands are unavailable.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {REMOTE_OPS.map(({ label, icon: Icon }) => (
                <Button key={label} variant="outline" size="sm" disabled>
                  <Icon className="size-4" />
                  {label}
                </Button>
              ))}
              <Button variant="danger" size="sm" disabled>
                <ShieldAlert className="size-4" />
                Emergency stop
              </Button>
            </div>
          </div>
        </Card>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            <h2 className="font-heading text-lg font-bold tracking-tight">Live health</h2>
            <Card padded={false}>
              {snap ? (
                <div className="p-5">
                  <p className="text-text-secondary text-xs font-bold tracking-wide uppercase">
                    Latest status
                  </p>
                  <p className="font-heading mt-2 text-3xl font-bold">
                    {STATUS_LABELS[status]}
                  </p>
                  <p className="text-text-secondary mt-2 text-sm">
                    Recorded {new Date(snap.recorded_at).toLocaleString()}
                  </p>
                </div>
              ) : (
                <EmptyState
                  icon={<RadioTower className="size-6" />}
                  title="No telemetry from this unit"
                  message="Connect a gateway to see live health, run diagnostics, and issue remote commands."
                />
              )}
            </Card>

            <Card padded={false}>
              <EmptyState
                title="Faults & diagnostics not wired yet"
                message="Fault history will appear here once the faults module ships (TECH-3.4)."
              />
            </Card>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <h2 className="font-heading text-lg font-bold tracking-tight">Identity</h2>
              <Card>
                <dl className="space-y-3 text-sm">
                  <Row label="Charger ID" value={terminal.id} />
                  <Row label="Connector" value={terminal.connector_type ?? '—'} />
                  <Row
                    label="Rated power"
                    value={terminal.power_kw != null ? `${terminal.power_kw} kW` : '—'}
                  />
                  <Row
                    label="Tariff"
                    value={
                      terminal.price_per_kwh != null
                        ? `Rs ${terminal.price_per_kwh}/kWh`
                        : '—'
                    }
                  />
                  <Row label="Hours" value={terminal.operating_hours ?? '—'} />
                </dl>
                <div className="border-border mt-4 flex gap-2 border-t pt-4">
                  <Button variant="outline" size="sm">
                    <QrCode className="size-4" />
                    QR code
                  </Button>
                  <Button variant="outline" size="sm">
                    RFID
                  </Button>
                </div>
              </Card>
            </div>

            <div className="space-y-3">
              <h2 className="font-heading text-lg font-bold tracking-tight">Service history</h2>
              <Card padded={false}>
                <EmptyState
                  title="No maintenance records"
                  message="Maintenance tickets will appear here once that module is wired."
                />
              </Card>
            </div>
          </div>
        </section>
      </div>
    );
  } catch (err) {
    if (err instanceof TenantAccessError) {
      return <TenantDenied title="Charger" message={err.message} />;
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
