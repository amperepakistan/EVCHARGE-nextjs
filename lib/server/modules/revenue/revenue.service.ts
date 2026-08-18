import type { ServerContext } from '@/lib/server/context';
import { AppError } from '@/lib/server/errors';
import { SCREENSHOT_AU } from '@/lib/screenshot-mode';
import { demoRevenueDashboard } from '@/lib/server/owner-demo-data';
import { screenshotOwnerTerminals } from '@/lib/server/screenshot-terminals';
import * as revenueRepo from '@/lib/server/modules/revenue/revenue.repository';
import * as terminalsRepo from '@/lib/server/modules/terminals/terminals.repository';

/** Product constant: owner share of charging gross (see Phase 2 plan). */
export const OWNER_REVENUE_SHARE = 0.35;

export async function ownerRevenueDashboard(ctx: ServerContext, ownerId: string, days = 14) {
  if (SCREENSHOT_AU) {
    const terminals = screenshotOwnerTerminals(ownerId);
    return { ...demoRevenueDashboard(terminals), rollups: [] };
  }

  try {
    const from = new Date();
    from.setUTCDate(from.getUTCDate() - days);
    const fromDay = from.toISOString().slice(0, 10);

    const [rollups, terminals] = await Promise.all([
      revenueRepo.listRollupsForOwner(ctx, ownerId, fromDay),
      terminalsRepo.listTerminalsForOwner(ctx, ownerId),
    ]);

    const byDay = new Map<string, { revenue: number; energyKwh: number }>();
    const byTerminal = new Map<string, { sessions: number; gross: number }>();

    for (const row of rollups) {
      const day = row.day;
      const prev = byDay.get(day) ?? { revenue: 0, energyKwh: 0 };
      byDay.set(day, {
        revenue: prev.revenue + row.revenue,
        energyKwh: prev.energyKwh + row.kwh_delivered,
      });

      const tPrev = byTerminal.get(row.terminal_id) ?? { sessions: 0, gross: 0 };
      byTerminal.set(row.terminal_id, {
        sessions: tPrev.sessions + row.session_count,
        gross: tPrev.gross + row.revenue,
      });
    }

    const series = [...byDay.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({
        date,
        share: Math.round(v.revenue * OWNER_REVENUE_SHARE),
        energyKwh: v.energyKwh,
        revenue: v.revenue,
      }));

    const terminalName = new Map(terminals.map((t) => [t.id, t]));
    const rows = [...byTerminal.entries()]
      .map(([terminalId, v]) => {
        const terminal = terminalName.get(terminalId);
        if (!terminal) return null;
        return {
          terminal,
          sessions: v.sessions,
          gross: v.gross,
          share: Math.round(v.gross * OWNER_REVENUE_SHARE),
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => b.share - a.share);

    const grossTotal = series.reduce((sum, p) => sum + p.revenue, 0);
    const shareTotal = Math.round(grossTotal * OWNER_REVENUE_SHARE);

    return { series, rows, grossTotal, shareTotal, rollups };
  } catch (err) {
    ctx.logger.error('[revenue] owner dashboard failed', {
      message: err instanceof Error ? err.message : String(err),
    });
    throw new AppError(500, err instanceof Error ? err.message : 'Failed to load revenue');
  }
}
