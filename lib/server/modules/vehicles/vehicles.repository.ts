import type { ServerContext } from '@/lib/server/context';
import type { Tables } from '@/types/database.types';

export type EvVehicleRow = Tables<'ev_vehicles'>;

export async function listEvVehicles(ctx: ServerContext): Promise<EvVehicleRow[]> {
  const { data, error } = await ctx.db
    .from('ev_vehicles')
    .select(
      'id, brand, model, vehicle_type, battery_capacity_kwh, range_km, ac_charging_kw, dc_charging_kw, connector, price_pkr, source_url',
    )
    .order('brand', { ascending: true })
    .order('model', { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}
