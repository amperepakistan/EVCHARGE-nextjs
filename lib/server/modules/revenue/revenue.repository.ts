import type { ServerContext } from '@/lib/server/context';

export type DailyRollupRow = {
  day: string;
  terminal_id: string;
  vendor_id: string | null;
  owner_id: string | null;
  session_count: number;
  kwh_delivered: number;
  revenue: number;
};

export async function listRollupsForOwner(
  ctx: ServerContext,
  ownerId: string,
  fromDay: string,
): Promise<DailyRollupRow[]> {
  const { data, error } = await ctx.db
    .from('session_daily_rollups')
    .select(
      'day, terminal_id, vendor_id, owner_id, session_count, kwh_delivered, revenue',
    )
    .eq('owner_id', ownerId)
    .gte('day', fromDay)
    .order('day', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    ...r,
    session_count: Number(r.session_count),
    kwh_delivered: Number(r.kwh_delivered),
    revenue: Number(r.revenue),
  }));
}
