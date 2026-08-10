import type { ServerContext } from '@/lib/server/context';

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
