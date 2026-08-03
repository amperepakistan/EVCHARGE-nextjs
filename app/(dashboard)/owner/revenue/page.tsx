import { Lock } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { StatTile } from '@/components/ui/stat-tile';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { DataTable, type Column } from '@/components/ui/data-table';
import { TrendChart } from '@/components/features/dashboard/trend-chart';
import { getOwnerScope } from '@/lib/mock/scope';
import { terminalsForOwner } from '@/lib/mock/terminals';
import { mockRevenueSeries, mockSessions } from '@/lib/mock/operations';
import { canOwnerSee } from '@/lib/mock/field-visibility';
import type { MockTerminal } from '@/lib/mock/types';

const SHARE = 0.35;

interface Row {
  terminal: MockTerminal;
  sessions: number;
  gross: number;
  share: number;
}

const columns: Column<Row>[] = [
  {
    key: 'site',
    header: 'Charger',
    render: (r) => (
      <div className="min-w-0">
        <p className="text-text-primary truncate font-semibold">{r.terminal.name}</p>
        <p className="text-text-secondary truncate text-xs">{r.terminal.city}</p>
      </div>
    ),
  },
  {
    key: 'sessions',
    header: 'Sessions',
    align: 'right',
    render: (r) => <span className="tabular-nums">{r.sessions}</span>,
  },
  {
    key: 'gross',
    header: 'Gross',
    align: 'right',
    render: (r) => (
      <span className="text-text-secondary tabular-nums">Rs {r.gross.toLocaleString()}</span>
    ),
  },
  {
    key: 'share',
    header: 'Your share',
    align: 'right',
    render: (r) => (
      <span className="font-heading font-bold tabular-nums">
        Rs {r.share.toLocaleString()}
      </span>
    ),
  },
];

export default async function OwnerRevenuePage() {
  const { ownerId } = await getOwnerScope();

  // Field-level visibility is tiered per owner via the schema's
  // field_visibility_rules — this page is the clearest demonstration of it.
  if (!canOwnerSee(ownerId, 'revenue')) {
    return (
      <div className="space-y-6">
        <PageHeader title="Revenue" />
        <Card padded={false}>
          <EmptyState
            icon={<Lock className="size-6" />}
            title="Revenue is not enabled for your account"
            message="Your agreement does not include revenue-share reporting in the dashboard. Contact your network administrator if this looks wrong."
            action={<Button variant="outline">Contact administrator</Button>}
          />
        </Card>
      </div>
    );
  }

  const terminals = terminalsForOwner(ownerId);
  const rows: Row[] = terminals
    .map((terminal) => {
      const sessions = mockSessions.filter((s) => s.terminalId === terminal.id);
      const gross = sessions.reduce((sum, s) => sum + s.amountCharged, 0);
      return {
        terminal,
        sessions: sessions.length,
        gross,
        share: Math.round(gross * SHARE),
      };
    })
    .filter((r) => r.sessions > 0)
    .sort((a, b) => b.share - a.share);

  const grossTotal = mockRevenueSeries.reduce((sum, p) => sum + p.revenue, 0);
  const shareTotal = Math.round(grossTotal * SHARE);
  const series = mockRevenueSeries.map((p) => ({
    date: p.date,
    share: Math.round(p.revenue * SHARE),
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Revenue share"
        description="Your 35% share of charging revenue at your site, last 14 days."
        action={
          <Button variant="outline" size="sm">
            Export statement
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile
          label="Your share (14d)"
          value={`Rs ${shareTotal.toLocaleString()}`}
          variant="primary"
        />
        <StatTile
          label="Gross at your site"
          value={`Rs ${grossTotal.toLocaleString()}`}
          hint="Before revenue share"
        />
        <StatTile label="Next payout" value="Aug 07" hint="Monthly, in arrears" variant="ink" />
      </div>

      <Card>
        <h2 className="font-heading text-base font-bold">Daily share</h2>
        <div className="mt-4">
          <TrendChart data={series} xKey="date" yKey="share" valuePrefix="Rs " />
        </div>
      </Card>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-bold tracking-tight">By charger</h2>
        <DataTable
          columns={columns}
          rows={rows}
          getRowKey={(r) => r.terminal.id}
          emptyTitle="No sessions yet"
        />
      </section>
    </div>
  );
}
