import Link from 'next/link';
import { BatteryCharging, Building2, Lock, TrendingUp, Users } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { StatTile } from '@/components/ui/stat-tile';
import { Card } from '@/components/ui/card';
import { StatusDot, STATUS_LABELS } from '@/components/ui/status-dot';
import { Badge } from '@/components/ui/badge';
import { getOwnerScope } from '@/lib/mock/scope';
import { formatMoney } from '@/lib/screenshot-mode';
import { terminalsForOwner } from '@/lib/mock/terminals';
import { mockSessions } from '@/lib/mock/operations';
import { canOwnerSee } from '@/lib/mock/field-visibility';

export default async function OwnerOverviewPage() {
  const { ownerId, user } = await getOwnerScope();
  const terminals = terminalsForOwner(ownerId);
  const ids = terminals.map((t) => t.id);

  const available = terminals.filter((t) => t.status === 'available').length;
  const occupied = terminals.filter((t) => t.status === 'occupied').length;

  const sessions = mockSessions.filter((s) => ids.includes(s.terminalId));
  const live = sessions.filter((s) => s.endedAt === null && !s.noShow);
  const energy = sessions.reduce((sum, s) => sum + s.kwhDelivered, 0);
  const gross = sessions.reduce((sum, s) => sum + s.amountCharged, 0);
  // Owners are on a revenue share, not gross takings.
  const share = Math.round(gross * 0.35);

  const showRevenue = canOwnerSee(ownerId, 'revenue');

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${user?.organisation ?? 'Your sites'}`}
        description="Live status and takings for the chargers hosted on your property."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Available"
          value={available}
          hint={`of ${terminals.length} bays`}
          icon={<BatteryCharging className="size-4.5" />}
          variant="ink"
        />
        <StatTile label="In use" value={occupied} hint="Right now" tone="warning" />
        <StatTile
          label="Active drivers"
          value={live.length}
          hint="Charging at your site"
          icon={<Users className="size-4.5" />}
        />
        {showRevenue ? (
          <StatTile
            label="Your share today"
            value={formatMoney(share)}
            hint="35% revenue share"
            variant="primary"
          />
        ) : (
          <Card variant="muted">
            <div className="text-text-secondary flex items-center gap-2 text-xs font-bold tracking-wide uppercase">
              <Lock className="size-4" />
              Revenue
            </div>
            <p className="text-text-secondary mt-3 text-sm">
              Not enabled for your account.
            </p>
          </Card>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <StatTile
          label="Energy delivered"
          value={`${energy.toFixed(1)} kWh`}
          hint="Today, across your bays"
          icon={<TrendingUp className="size-4.5" />}
        />
        <StatTile
          label="Sites hosted"
          value={terminals.length}
          hint="Chargers on your property"
          icon={<Building2 className="size-4.5" />}
        />
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold tracking-tight">Your bays</h2>
          <Link
            href="/owner/sites"
            className="text-primary-800 text-sm font-semibold hover:underline"
          >
            Manage listings
          </Link>
        </div>
        <Card padded={false}>
          <ul className="divide-border divide-y">
            {terminals.map((terminal) => (
              <li key={terminal.id} className="flex items-center gap-4 p-4">
                <StatusDot status={terminal.status ?? 'unknown'} />
                <div className="min-w-0 flex-1">
                  <p className="text-text-primary truncate text-sm font-semibold">
                    {terminal.name}
                  </p>
                  <p className="text-text-secondary truncate text-xs">
                    {terminal.chargerClass} · {terminal.connectorType} · {terminal.powerKw} kW
                  </p>
                </div>
                <Badge
                  tone={
                    terminal.status === 'available'
                      ? 'success'
                      : terminal.status === 'occupied'
                        ? 'warning'
                        : terminal.status === null
                          ? 'neutral'
                          : 'danger'
                  }
                >
                  {STATUS_LABELS[terminal.status ?? 'unknown']}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
