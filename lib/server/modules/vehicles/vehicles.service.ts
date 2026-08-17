import type { ServerContext } from '@/lib/server/context';
import { AppError } from '@/lib/server/errors';
import * as vehiclesRepo from '@/lib/server/modules/vehicles/vehicles.repository';

export type CatalogVehicle = {
  id: string;
  brand: string;
  model: string;
  connectorType: string;
  vehicleType: string | null;
  batteryKwh: number | null;
  rangeKm: number | null;
  acKw: number | null;
  dcKw: number | null;
  pricePkr: number | null;
};

function toNumber(value: number | string | null | undefined): number | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function listCatalog(ctx: ServerContext) {
  try {
    const rows = await vehiclesRepo.listEvVehicles(ctx);
    const vehicles: CatalogVehicle[] = rows.map((row) => ({
      id: row.id,
      brand: row.brand,
      model: row.model,
      connectorType: row.connector,
      vehicleType: row.vehicle_type,
      batteryKwh: toNumber(row.battery_capacity_kwh),
      rangeKm: toNumber(row.range_km),
      acKw: toNumber(row.ac_charging_kw),
      dcKw: toNumber(row.dc_charging_kw),
      pricePkr: toNumber(row.price_pkr),
    }));
    return { vehicles };
  } catch (err) {
    ctx.logger.error('[vehicles] list failed', {
      message: err instanceof Error ? err.message : String(err),
    });
    throw new AppError(500, err instanceof Error ? err.message : 'Failed to list vehicles');
  }
}
