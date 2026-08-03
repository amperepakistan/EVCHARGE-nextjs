import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  DoorClosed,
  Fan,
  Gauge,
  Lock,
  Power,
  QrCode,
  RadioTower,
  RefreshCw,
  ShieldAlert,
  Square,
  Thermometer,
  Unlock,
  Zap,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusDot, STATUS_LABELS } from '@/components/ui/status-dot';
import { isConnected, terminalById } from '@/lib/mock/terminals';
import { faultsFor, healthFor, maintenanceFor } from '@/lib/mock/operations';

/** §2 Remote Operations — vendor-only per docs/feature-roles.md. */
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
  const { id } = await params;
  const terminal = terminalById(id);
  if (!terminal) notFound();

  const health = healthFor(terminal.id);
  const faults = faultsFor(terminal.id);
  const jobs = maintenanceFor(terminal.id);
  const connected = isConnected(terminal.connectivityTier);

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
        description={`${terminal.address}, ${terminal.city} · installed ${terminal.installedAt}`}
        action={
          <>
            <Badge tone={connected ? 'success' : 'neutral'}>
              {connected ? 'Connected' : 'Listed'}
            </Badge>
            <span className="border-border rounded-tag flex items-center gap-2 border px-2.5 py-1">
              <StatusDot status={terminal.status ?? 'unknown'} />
              <span className="text-xs font-bold">
                {STATUS_LABELS[terminal.status ?? 'unknown']}
              </span>
            </span>
          </>
        }
      />

      {/* Remote ops are meaningless without a live link — say so rather than
          rendering dead buttons. */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-base font-bold">Remote operations</h2>
            <p className="text-text-secondary mt-1 text-sm">
              {connected
                ? 'Commands are delivered over OCPP 1.6J to the unit.'
                : 'This charger has no live link, so remote commands are unavailable.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {REMOTE_OPS.map(({ label, icon: Icon }) => (
              <Button key={label} variant="outline" size="sm" disabled={!connected}>
                <Icon className="size-4" />
                {label}
              </Button>
            ))}
            <Button variant="danger" size="sm" disabled={!connected}>
              <ShieldAlert className="size-4" />
              Emergency stop
            </Button>
          </div>
        </div>
      </Card>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <h2 className="font-heading text-lg font-bold tracking-tight">Live health</h2>
          {health ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Card>
                <div className="flex items-baseline justify-between">
                  <span className="text-text-secondary text-xs font-bold tracking-wide uppercase">
                    Health score
                  </span>
                  <span className="text-text-secondary text-xs">
                    {health.lastHeartbeat}
                  </span>
                </div>
                <p
                  className={`font-heading mt-2 text-5xl font-bold tracking-tight ${
                    health.healthScore >= 80
                      ? 'text-available'
                      : health.healthScore >= 60
                        ? 'text-occupied'
                        : 'text-offline'
                  }`}
                >
                  {health.healthScore}
                  <span className="text-text-secondary text-lg font-medium"> / 100</span>
                </p>
                <ul className="mt-4 space-y-1.5">
                  <CheckRow ok={health.communicationOk} label="Communication" />
                  <CheckRow ok={health.coolingFanOk} label="Cooling" />
                  <CheckRow ok={health.contactorOk} label="Contactor" />
                  <CheckRow ok={health.isolationOk} label="Isolation" />
                  <CheckRow ok={health.doorClosed} label="Enclosure door" />
                </ul>
              </Card>

              <div className="grid gap-3 sm:grid-cols-2">
                <Reading
                  icon={<Thermometer className="size-4" />}
                  label="Internal"
                  value={`${health.internalTempC}°C`}
                  warn={health.internalTempC > 60}
                />
                <Reading
                  icon={<Thermometer className="size-4" />}
                  label="Connector"
                  value={`${health.connectorTempC}°C`}
                  warn={health.connectorTempC > 55}
                />
                <Reading
                  icon={<Gauge className="size-4" />}
                  label="Voltage"
                  value={`${health.voltageV} V`}
                  warn={health.voltageV === 0}
                />
                <Reading
                  icon={<Zap className="size-4" />}
                  label="Current"
                  value={`${health.currentA} A`}
                />
                <Reading
                  icon={<Fan className="size-4" />}
                  label="Cooling fan"
                  value={health.coolingFanOk ? 'Nominal' : 'Not responding'}
                  warn={!health.coolingFanOk}
                />
                <Reading
                  icon={<DoorClosed className="size-4" />}
                  label="Door"
                  value={health.doorClosed ? 'Closed' : 'Open'}
                  warn={!health.doorClosed}
                />
              </div>
            </div>
          ) : (
            <Card>
              <div className="flex items-start gap-3">
                <RadioTower className="text-text-secondary mt-0.5 size-5 shrink-0" />
                <div>
                  <p className="text-text-primary text-sm font-semibold">
                    No telemetry from this unit
                  </p>
                  <p className="text-text-secondary mt-1 text-sm">
                    It is a listed-tier charger. Connect a gateway to see live health,
                    run diagnostics, and issue remote commands.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {health && health.recommendations.length > 0 ? (
            <Card variant="ink">
              <h3 className="text-on-ink/60 text-xs font-bold tracking-wide uppercase">
                Predictive maintenance
              </h3>
              <ul className="mt-3 space-y-2">
                {health.recommendations.map((rec) => (
                  <li key={rec} className="flex items-start gap-2.5 text-sm">
                    <span className="bg-primary mt-1.5 size-1.5 shrink-0 rounded-full" />
                    {rec}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="font-heading text-lg font-bold tracking-tight">Identity</h2>
            <Card>
              <dl className="space-y-3 text-sm">
                <Row label="Charger ID" value={terminal.id} />
                <Row label="Connector" value={terminal.connectorType} />
                <Row label="Rated power" value={`${terminal.powerKw} kW`} />
                <Row label="Tariff" value={`Rs ${terminal.pricePerKwh}/kWh`} />
                <Row label="Hours" value={terminal.operatingHours} />
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
              {jobs.length === 0 ? (
                <p className="text-text-secondary p-4 text-sm">No recorded visits.</p>
              ) : (
                <ul className="divide-border divide-y">
                  {jobs.map((job) => (
                    <li key={job.id} className="p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-text-primary text-sm font-semibold">{job.title}</p>
                        <Badge
                          tone={job.status === 'completed' ? 'success' : 'warning'}
                        >
                          {job.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-text-secondary mt-1 text-xs">
                        {job.scheduledFor} · {job.technician}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          {faults.length > 0 ? (
            <div className="space-y-3">
              <h2 className="font-heading text-lg font-bold tracking-tight">Fault log</h2>
              <Card padded={false}>
                <ul className="divide-border divide-y">
                  {faults.map((fault) => (
                    <li key={fault.id} className="p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-text-primary text-sm font-semibold">
                          {fault.label}
                        </p>
                        <Badge tone={fault.status === 'resolved' ? 'success' : 'danger'}>
                          {fault.status}
                        </Badge>
                      </div>
                      <p className="text-text-secondary mt-1 font-mono text-xs">
                        {fault.code} · {fault.detectedAt}
                      </p>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function CheckRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <span className={ok ? 'text-available' : 'text-offline'}>{ok ? '✓' : '⚠'}</span>
      <span className={ok ? 'text-text-secondary' : 'text-offline font-semibold'}>
        {label}
      </span>
    </li>
  );
}

function Reading({
  icon,
  label,
  value,
  warn = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div className="border-border rounded-image border p-3.5">
      <div className="text-text-secondary flex items-center gap-1.5 text-xs font-semibold">
        {icon}
        {label}
      </div>
      <p
        className={`font-heading mt-1.5 text-lg font-bold ${warn ? 'text-offline' : 'text-text-primary'}`}
      >
        {value}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-text-secondary">{label}</dt>
      <dd className="text-text-primary text-right font-semibold">{value}</dd>
    </div>
  );
}
