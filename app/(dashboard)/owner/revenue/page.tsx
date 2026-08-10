import { Lock } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { StatTile } from '@/components/ui/stat-tile';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { DataTable, type Column } from '@/components/ui/data-table';
import { TrendChart } from '@/components/features/dashboard/trend-chart';
import { requireOwnerDashboard, TenantAccessError } from '@/lib/server/dashboard';
import { TenantDenied } from '@/components/features/dashboard/tenant-denied';
import * as visibilityService from '@/lib/server/modules/field-visibility/field-visibility.service';
import * as revenueService from '@/lib/server/modules/revenue/revenue.service';

/** Product constant: owner share of charging gross. */
const SHARE = revenueService.OWNER_REVENUE_SHARE;

type TerminalSummary = {
  id: string;
  name: string;
  city: string | null;
};

interface Row {
  terminal: TerminalSummary;
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
      <span className="text-text-secondary tabular-nums">
        Rs {Math.round(r.gross).toLocaleString()}
      </span>
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
  try {
    const { ctx, scope } = await requireOwnerDashboard();
    const canSee = await visibilityService.canOwnerSee(ctx, scope.ownerId, 'revenue');

    if (!canSee) {
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

    const { series, rows, grossTotal, shareTotal } = await revenueService.ownerRevenueDashboard(
      ctx,
      scope.ownerId,
    );

    return (
      <div className="space-y-8">
        <PageHeader
          title="Revenue share"
          description={`Your ${Math.round(SHARE * 100)}% share of charging revenue at your site (from daily rollups).`}
          action={
            <Button variant="outline" size="sm">
              Export statement
            </Button>
          }
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <StatTile
            label="Your share"
            value={`Rs ${shareTotal.toLocaleString()}`}
            variant="primary"
          />
          <StatTile
            label="Gross at your site"
            value={`Rs ${Math.round(grossTotal).toLocaleString()}`}
            hint="Before revenue share"
          />
          <StatTile
            label="Rollup days"
            value={series.length}
            hint="Run refresh-session-rollups after new sessions"
            variant="ink"
          />
        </div>

        {series.length === 0 ? (
          <Card padded={false}>
            <EmptyState
              title="No revenue rollups yet"
              message="Session daily rollups are empty. After sessions exist, run scripts/refresh-session-rollups.mjs."
            />
          </Card>
        ) : (
          <Card>
            <h2 className="font-heading text-base font-bold">Daily share</h2>
            <div className="mt-4">
              <TrendChart data={series} xKey="date" yKey="share" valuePrefix="Rs " />
            </div>
          </Card>
        )}

        <section className="space-y-3">
          <h2 className="font-heading text-lg font-bold tracking-tight">By charger</h2>
          <DataTable
            columns={columns}
            rows={rows}
            getRowKey={(r) => r.terminal.id}
            emptyTitle="No sessions yet"
            emptyMessage="Per-charger revenue appears after rollups are refreshed."
          />
        </section>
      </div>
    );
  } catch (err) {
    if (err instanceof TenantAccessError) {
      return <TenantDenied title="Revenue" message={err.message} />;
    }
    throw err;
  }
}
