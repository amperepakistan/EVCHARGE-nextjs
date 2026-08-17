import type { ServerContext } from '@/lib/server/context';
import type { Tables } from '@/types/database.types';

export type EvVehicleRow = Tables<'ev_vehicles'>;

export async function listEvVehicles(ctx: ServerContext): Promise<EvVehicleRow[]> {
  const { data, error } = await ctx.db
    .from('ev_vehicles')
    .select('*')
    .order('brand', { ascending: true })
    .order('model', { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}
