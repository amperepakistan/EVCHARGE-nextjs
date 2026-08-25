import type { ServerContext } from '@/lib/server/context';
import type {
  CreateTerminalInput,
  UpdateTerminalInput,
} from '@/lib/server/modules/terminals/terminals.schema';
import type { Tables, TerminalStatus } from '@/types/database.types';
import { toTerminalInsert, toTerminalUpdate } from '@/lib/utils/terminal-mapper';

const DASHBOARD_LIST_COLUMNS =
  'id, name, latitude, longitude, city, address, connector_type, charger_class, target_vehicle_category, power_kw, price_per_kwh, operating_hours, phone_number, amenities, connectivity_tier, verification_status, google_place_id, google_maps_url, google_rating, google_rating_count, google_photo_urls, is_public, current_vendor_id, current_owner_id, created_at, updated_at';

const PUBLIC_LIST_COLUMNS =
  'id, name, latitude, longitude, city, address, connector_type, charger_class, target_vehicle_category, power_kw, price_per_kwh, operating_hours, phone_number, connectivity_tier, verification_status, google_place_id, google_maps_url, google_rating, google_rating_count, google_photo_urls, is_public';

export type TerminalRow = Tables<'terminals'>;

export type TerminalStatusSnapshot = {
  terminal_id: string;
  status: TerminalStatus;
  recorded_at: string;
};

export async function listPublicTerminals(ctx: ServerContext, city?: string | null) {
  let query = ctx.db
    .from('terminals')
    .select(PUBLIC_LIST_COLUMNS)
    .eq('is_public', true)
    .order('name');

  if (city) {
    query = query.eq('city', city);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function listTerminalsForOwner(ctx: ServerContext, ownerId: string) {
  const { data, error } = await ctx.db
    .from('terminals')
    .select(DASHBOARD_LIST_COLUMNS)
    .eq('current_owner_id', ownerId)
    .order('name');

  if (error) {
    throw new Error(error.message);
  }
  return data ?? [];
}

export async function listTerminalsForVendor(ctx: ServerContext, vendorId: string) {
  const { data, error } = await ctx.db
    .from('terminals')
    .select(DASHBOARD_LIST_COLUMNS)
    .eq('current_vendor_id', vendorId)
    .order('name');

  if (error) {
    throw new Error(error.message);
  }
  return data ?? [];
}

export async function getTerminalForVendor(
  ctx: ServerContext,
  vendorId: string,
  terminalId: string,
) {
  const { data, error } = await ctx.db
    .from('terminals')
    .select(DASHBOARD_LIST_COLUMNS)
    .eq('id', terminalId)
    .eq('current_vendor_id', vendorId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function getLatestStatusSnapshots(
  ctx: ServerContext,
  terminalIds: string[],
): Promise<Map<string, TerminalStatusSnapshot>> {
  const map = new Map<string, TerminalStatusSnapshot>();
  if (terminalIds.length === 0) return map;

  const { data, error } = await ctx.db
    .from('terminal_status_snapshots')
    .select('terminal_id, status, recorded_at')
    .in('terminal_id', terminalIds)
    .order('recorded_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  for (const row of data ?? []) {
    if (!map.has(row.terminal_id)) {
      map.set(row.terminal_id, row);
    }
  }
  return map;
}

export async function getTerminalById(ctx: ServerContext, id: string) {
  const { data, error } = await ctx.db.from('terminals').select('*').eq('id', id).maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

/** Driver scout insert — only columns that exist on the live terminals table. */
export async function insertScoutTerminal(
  ctx: ServerContext,
  input: {
    name: string;
    latitude: number;
    longitude: number;
    city?: string;
    address?: string;
    connectorType?: string;
    chargerClass?: 'AC' | 'DC';
    amenities: string[];
  },
) {
  const { data, error } = await ctx.db
    .from('terminals')
    .insert({
      name: input.name,
      latitude: input.latitude,
      longitude: input.longitude,
      city: input.city ?? null,
      address: input.address ?? null,
      connector_type: input.connectorType ?? null,
      charger_class: input.chargerClass ?? null,
      source: 'manual',
      is_public: false,
      verification_status: 'unverified',
      connectivity_tier: 'listed',
      amenities: input.amenities,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function insertTerminal(ctx: ServerContext, input: CreateTerminalInput) {
  const insert = toTerminalInsert({
    ...input,
    source: input.source ?? 'manual',
  });

  const { data, error } = await ctx.db.from('terminals').insert(insert).select().single();
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function updateTerminalById(
  ctx: ServerContext,
  id: string,
  input: UpdateTerminalInput,
) {
  const { data, error } = await ctx.db
    .from('terminals')
    .update(toTerminalUpdate(input))
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function deleteTerminalById(ctx: ServerContext, id: string) {
  const { error } = await ctx.db.from('terminals').delete().eq('id', id);
  if (error) {
    throw new Error(error.message);
  }
}
