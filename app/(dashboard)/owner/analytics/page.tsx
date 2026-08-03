import { PageHeader } from '@/components/ui/page-header';
import { StatTile } from '@/components/ui/stat-tile';
import { Card } from '@/components/ui/card';
import { TrendChart } from '@/components/features/dashboard/trend-chart';
import { getOwnerScope } from '@/lib/mock/scope';
import { terminalsForOwner } from '@/lib/mock/terminals';
import { mockHourlyUsage, mockRevenueSeries, mockSessions } from '@/lib/mock/operations';

export default async function OwnerAnalyticsPage() {
  const { ownerId } = await getOwnerScope();
  const terminals = terminalsForOwner(ownerId);
  const ids = terminals.map((t) => t.id);
  const sessions = mockSessions.filter((s) => ids.includes(s.terminalId));

  const peak = mockHourlyUsage.reduce((a, b) => (b.sessions > a.sessions ? b : a));
  const avgKwh =
    sessions.length > 0
      ? sessions.reduce((sum, s) => sum + s.kwhDelivered, 0) / sessions.length
      : 0;
  const busiest = terminals.reduce<{ name: string; count: number }>(
    (best, terminal) => {
      const count = sessions.filter((s) => s.terminalId === terminal.id).length;
      return count > best.count ? { name: terminal.name, count } : best;
    },
    { name: '—', count: 0 },
  );

  const energySeries = mockRevenueSeries.map((p) => ({
    date: p.date,
    energyKwh: p.energyKwh,
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        description="How your bays actually get used — when they are busy and how long drivers stay."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile
          label="Peak hour"
          value={`${peak.hour}:00`}
          hint={`${peak.sessions} sessions`}
          variant="ink"
        />
        <StatTile label="Avg session" value={`${avgKwh.toFixed(1)} kWh`} hint="Per driver" />
        <StatTile
          label="Busiest bay"
          value={busiest.count}
          hint={busiest.name}
        />
      </div>

      <Card>
        <h2 className="font-heading text-base font-bold">Sessions by hour</h2>
        <p className="text-text-secondary mt-1 text-sm">
          Evening peak is when drivers finish work — worth staffing around.
        </p>
        <div className="mt-4">
          <TrendChart
            data={mockHourlyUsage}
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
            data={energySeries}
            xKey="date"
            yKey="energyKwh"
            valueSuffix=" kWh"
            height={240}
          />
        </div>
      </Card>
    </div>
  );
}
