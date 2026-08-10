import { PageHeader } from '@/components/ui/page-header';
import { StatTile } from '@/components/ui/stat-tile';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { TrendChart } from '@/components/features/dashboard/trend-chart';
import { requireOwnerDashboard, TenantAccessError } from '@/lib/server/dashboard';
import { TenantDenied } from '@/components/features/dashboard/tenant-denied';
import * as sessionsService from '@/lib/server/modules/sessions/sessions.service';
import * as revenueService from '@/lib/server/modules/revenue/revenue.service';
import * as terminalsService from '@/lib/server/modules/terminals/terminals.service';

export default async function OwnerAnalyticsPage() {
  try {
    const { ctx, scope } = await requireOwnerDashboard();
    const [terminals, sessions, hourly, revenue] = await Promise.all([
      terminalsService.listTerminalsForOwner(ctx, scope.ownerId),
      sessionsService.listOwnerSessions(ctx, scope.ownerId),
      sessionsService.ownerHourlyUsage(ctx, scope.ownerId, 7),
      revenueService.ownerRevenueDashboard(ctx, scope.ownerId, 14),
    ]);

    const peak = hourly.reduce((a, b) => (b.sessions > a.sessions ? b : a), {
      hour: 0,
      sessions: 0,
    });
    const avgKwh =
      sessions.length > 0
        ? sessions.reduce((sum, s) => sum + Number(s.kwh_delivered ?? 0), 0) / sessions.length
        : 0;
    const busiest = terminals.reduce<{ name: string; count: number }>(
      (best, terminal) => {
        const count = sessions.filter((s) => s.terminal_id === terminal.id).length;
        return count > best.count ? { name: terminal.name, count } : best;
      },
      { name: '—', count: 0 },
    );

    const energySeries = revenue.series.map((p) => ({
      date: p.date,
      energyKwh: p.energyKwh,
    }));
    const hasHourly = hourly.some((h) => h.sessions > 0);

    return (
      <div className="space-y-8">
        <PageHeader
          title="Analytics"
          description="How your bays actually get used — when they are busy and how long drivers stay."
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <StatTile
            label="Peak hour (UTC)"
            value={`${peak.hour}:00`}
            hint={`${peak.sessions} sessions (7d)`}
            variant="ink"
          />
          <StatTile label="Avg session" value={`${avgKwh.toFixed(1)} kWh`} hint="Per listed session" />
          <StatTile label="Busiest bay" value={busiest.count} hint={busiest.name} />
        </div>

        <Card>
          <h2 className="font-heading text-base font-bold">Sessions by hour</h2>
          <p className="text-text-secondary mt-1 text-sm">
            Last 7 days, grouped by UTC hour of session start.
          </p>
          {hasHourly ? (
            <div className="mt-4">
              <TrendChart
                data={hourly}
                xKey="hour"
                yKey="sessions"
                kind="bar"
                valueSuffix=" sessions"
                height={240}
              />
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState
                title="No recent sessions"
                message="Hourly usage will appear once charging sessions are recorded."
              />
            </div>
          )}
        </Card>

        <Card>
          <h2 className="font-heading text-base font-bold">Energy delivered</h2>
          {energySeries.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="No energy rollups"
                message="Refresh session_daily_rollups after sessions exist."
              />
            </div>
          ) : (
            <div className="mt-4">
              <TrendChart
                data={energySeries}
                xKey="date"
                yKey="energyKwh"
                valueSuffix=" kWh"
                height={240}
              />
            </div>
          )}
        </Card>
      </div>
    );
  } catch (err) {
    if (err instanceof TenantAccessError) {
      return <TenantDenied title="Analytics" message={err.message} />;
    }
    throw err;
  }
}
