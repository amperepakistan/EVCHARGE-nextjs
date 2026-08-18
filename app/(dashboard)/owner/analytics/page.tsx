import { PageHeader } from '@/components/ui/page-header';
import { StatTile } from '@/components/ui/stat-tile';
import { Card } from '@/components/ui/card';
import { TrendChart } from '@/components/features/dashboard/trend-chart';
import { requireOwnerDashboard, TenantAccessError } from '@/lib/server/dashboard';
import { TenantDenied } from '@/components/features/dashboard/tenant-denied';
import { demoAnalyticsStats } from '@/lib/server/owner-demo-data';
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
    const demo =
      !hasHourly || energySeries.length === 0
        ? demoAnalyticsStats(terminals.map((t) => t.name))
        : null;
    const peakView = demo?.peak ?? peak;
    const avgView = demo?.avgKwh ?? avgKwh;
    const busiestView = demo?.busiest ?? busiest;
    const hourlyView = hasHourly ? hourly : demo!.hourly;
    const energyView = energySeries.length > 0 ? energySeries : demo!.energySeries;

    return (
      <div className="space-y-8">
        <PageHeader
          title="Analytics"
          description="How your bays actually get used — when they are busy and how long drivers stay."
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <StatTile
            label="Peak hour (UTC)"
            value={`${peakView.hour}:00`}
            hint={`${peakView.sessions} sessions (7d)`}
            variant="ink"
          />
          <StatTile
            label="Avg session"
            value={`${avgView.toFixed(1)} kWh`}
            hint="Per listed session"
          />
          <StatTile label="Busiest bay" value={busiestView.count} hint={busiestView.name} />
        </div>

        <Card>
          <h2 className="font-heading text-base font-bold">Sessions by hour</h2>
          <p className="text-text-secondary mt-1 text-sm">
            Last 7 days, grouped by UTC hour of session start.
          </p>
          <div className="mt-4">
            <TrendChart
              data={hourlyView}
              xKey="hour"
              yKey="sessions"
              kind="bar"
              valueSuffix=" sessions"
              height={240}
            />
          </div>
        </Card>

        <Card>
          <h2 className="font-heading text-base font-bold">Energy delivered</h2>
          <div className="mt-4">
            <TrendChart
              data={energyView}
              xKey="date"
              yKey="energyKwh"
              valueSuffix=" kWh"
              height={240}
            />
          </div>
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
