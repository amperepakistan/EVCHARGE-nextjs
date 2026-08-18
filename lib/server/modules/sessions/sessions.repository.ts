import type { ServerContext } from '@/lib/server/context';
import { SCREENSHOT_AU } from '@/lib/screenshot-mode';
import { mockHourlyUsage, mockSessions } from '@/lib/mock/operations';
import { mockTerminals, OWNER_ID_MALL } from '@/lib/mock/terminals';

export type SessionListRow = {
  id: string;
  terminal_id: string;
  terminal_name: string | null;
  driver_id: string | null;
  started_at: string;
  ended_at: string | null;
  kwh_delivered: number | null;
  amount_charged: number | null;
};

export async function listSessionsForOwner(
  ctx: ServerContext,
  ownerId: string,
  limit = 100,
): Promise<SessionListRow[]> {
  if (SCREENSHOT_AU) {
    const ownerTerminals = mockTerminals.filter((t) => t.ownerId === OWNER_ID_MALL);
    const ids = new Set(ownerTerminals.map((t) => t.id));
    const nameById = new Map(ownerTerminals.map((t) => [t.id, t.name]));
    return mockSessions
      .filter((s) => ids.has(s.terminalId))
      .slice(0, limit)
      .map((s) => ({
        id: s.id,
        terminal_id: s.terminalId,
        terminal_name: nameById.get(s.terminalId) ?? null,
        driver_id: s.driverLabel,
        started_at: s.startedAt.replace(' ', 'T') + ':00Z',
        ended_at: s.endedAt ? s.endedAt.replace(' ', 'T') + ':00Z' : null,
        kwh_delivered: s.kwhDelivered,
        amount_charged: s.amountCharged,
      }));
  }

  const { data: terminals, error: termError } = await ctx.db
    .from('terminals')
    .select('id, name')
    .eq('current_owner_id', ownerId);

  if (termError) throw new Error(termError.message);
  const terminalIds = (terminals ?? []).map((t) => t.id);
  if (terminalIds.length === 0) return [];

  const nameById = new Map((terminals ?? []).map((t) => [t.id, t.name]));

  const { data, error } = await ctx.db
    .from('charging_sessions')
    .select('id, terminal_id, driver_id, started_at, ended_at, kwh_delivered, amount_charged')
    .in('terminal_id', terminalIds)
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return (data ?? []).map((s) => ({
    ...s,
    terminal_name: nameById.get(s.terminal_id) ?? null,
  }));
}

export async function hourlySessionCountsForOwner(
  ctx: ServerContext,
  ownerId: string,
  sinceIso: string,
): Promise<{ hour: number; sessions: number }[]> {
  if (SCREENSHOT_AU) {
    const byHour = new Map(mockHourlyUsage.map((r) => [Number.parseInt(r.hour, 10), r.sessions]));
    return Array.from({ length: 24 }, (_, hour) => ({
      hour,
      sessions: byHour.get(hour) ?? 0,
    }));
  }

  const { data: terminals, error: termError } = await ctx.db
    .from('terminals')
    .select('id')
    .eq('current_owner_id', ownerId);

  if (termError) throw new Error(termError.message);
  const terminalIds = (terminals ?? []).map((t) => t.id);
  if (terminalIds.length === 0) {
    return Array.from({ length: 24 }, (_, hour) => ({ hour, sessions: 0 }));
  }

  const { data, error } = await ctx.db
    .from('charging_sessions')
    .select('started_at, terminal_id')
    .in('terminal_id', terminalIds)
    .gte('started_at', sinceIso);

  if (error) throw new Error(error.message);

  const counts = Array.from({ length: 24 }, () => 0);
  for (const row of data ?? []) {
    const hour = new Date(row.started_at).getUTCHours();
    counts[hour] += 1;
  }
  return counts.map((sessions, hour) => ({ hour, sessions }));
}
