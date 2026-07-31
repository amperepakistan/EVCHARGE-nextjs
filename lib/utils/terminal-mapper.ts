import type { CreateTerminalInput, UpdateTerminalInput } from '@/lib/validations/terminal';
import type { Database } from '@/types/database.types';

type TerminalInsert = Database['public']['Tables']['terminals']['Insert'];
type TerminalUpdate = Database['public']['Tables']['terminals']['Update'];

/** Map camelCase API/form fields → snake_case DB columns. */
export function toTerminalInsert(input: CreateTerminalInput): TerminalInsert {
  return {
    name: input.name,
    latitude: input.latitude,
    longitude: input.longitude,
    city: input.city,
    address: input.address,
    charger_class: input.chargerClass,
    connector_type: input.connectorType,
    power_kw: input.powerKw,
    price_per_kwh: input.pricePerKwh,
    operating_hours: input.operatingHours,
    connectivity_tier: input.connectivityTier,
    current_vendor_id: input.currentVendorId,
    current_owner_id: input.currentOwnerId,
    source: input.source,
    is_public: input.isPublic,
  };
}

export function toTerminalUpdate(input: UpdateTerminalInput): TerminalUpdate {
  const row: TerminalUpdate = {};
  if (input.name !== undefined) row.name = input.name;
  if (input.latitude !== undefined) row.latitude = input.latitude;
  if (input.longitude !== undefined) row.longitude = input.longitude;
  if (input.city !== undefined) row.city = input.city;
  if (input.address !== undefined) row.address = input.address;
  if (input.chargerClass !== undefined) row.charger_class = input.chargerClass;
  if (input.connectorType !== undefined) row.connector_type = input.connectorType;
  if (input.powerKw !== undefined) row.power_kw = input.powerKw;
  if (input.pricePerKwh !== undefined) row.price_per_kwh = input.pricePerKwh;
  if (input.operatingHours !== undefined) row.operating_hours = input.operatingHours;
  if (input.connectivityTier !== undefined) row.connectivity_tier = input.connectivityTier;
  if (input.currentVendorId !== undefined) row.current_vendor_id = input.currentVendorId;
  if (input.currentOwnerId !== undefined) row.current_owner_id = input.currentOwnerId;
  if (input.source !== undefined) row.source = input.source;
  if (input.isPublic !== undefined) row.is_public = input.isPublic;
  return row;
}
