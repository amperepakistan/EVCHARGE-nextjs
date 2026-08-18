import type { ServerContext } from '@/lib/server/context';
import type { Tables, TerminalStatus } from '@/types/database.types';
import { SCREENSHOT_AU } from '@/lib/screenshot-mode';
import { screenshotAllTerminals } from '@/lib/server/screenshot-terminals';

export type VendorRow = Tables<'vendors'>;
export type OwnerRow = Tables<'terminal_owners'>;

const TERMINAL_ADMIN_COLUMNS =
  'id, name, city, address, latitude, longitude, connector_type, charger_class, power_kw, connectivity_tier, verification_status, current_vendor_id, current_owner_id, is_public, source, amenities, created_at';

export async function listVendors(ctx: ServerContext): Promise<VendorRow[]> {
  const { data, error } = await ctx.db.from('vendors').select('*').order('name');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getVendorById(
  ctx: ServerContext,
  vendorId: string,
): Promise<VendorRow | null> {
  const { data, error } = await ctx.db
    .from('vendors')
    .select('*')
    .eq('id', vendorId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function listOwners(ctx: ServerContext): Promise<OwnerRow[]> {
  const { data, error } = await ctx.db.from('terminal_owners').select('*').order('name');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getOwnerById(
  ctx: ServerContext,
  ownerId: string,
): Promise<OwnerRow | null> {
  const { data, error } = await ctx.db
    .from('terminal_owners')
    .select('*')
    .eq('id', ownerId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function countTerminals(ctx: ServerContext): Promise<number> {
  if (SCREENSHOT_AU) return screenshotAllTerminals().length;

  const { count, error } = await ctx.db
    .from('terminals')
    .select('id', { count: 'exact', head: true });
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function countDrivers(ctx: ServerContext): Promise<number> {
  const { count, error } = await ctx.db
    .from('drivers')
    .select('id', { count: 'exact', head: true });
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function listAllTerminals(ctx: ServerContext, limit = 200) {
  if (SCREENSHOT_AU) return screenshotAllTerminals().slice(0, limit);

  const { data, error } = await ctx.db
    .from('terminals')
    .select(TERMINAL_ADMIN_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getUsersByIds(
  ctx: ServerContext,
  ids: string[],
): Promise<Map<string, { full_name: string | null; email: string | null }>> {
  if (ids.length === 0) return new Map();
  const { data, error } = await ctx.db
    .from('users')
    .select('id, full_name, email')
    .in('id', ids);
  if (error) throw new Error(error.message);
  return new Map(
    (data ?? []).map((u) => [u.id, { full_name: u.full_name, email: u.email }]),
  );
}

export type NetworkSessionRow = {
  id: string;
  terminal_id: string;
  terminal_name: string | null;
  driver_id: string | null;
  started_at: string;
  ended_at: string | null;
  kwh_delivered: number | null;
  amount_charged: number | null;
};

export async function listRecentSessions(
  ctx: ServerContext,
  limit = 100,
): Promise<NetworkSessionRow[]> {
  const { data, error } = await ctx.db
    .from('charging_sessions')
    .select('id, terminal_id, driver_id, started_at, ended_at, kwh_delivered, amount_charged')
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  const rows = data ?? [];
  if (rows.length === 0) return [];

  const terminalIds = [...new Set(rows.map((r) => r.terminal_id))];
  const { data: terminals, error: termError } = await ctx.db
    .from('terminals')
    .select('id, name')
    .in('id', terminalIds);
  if (termError) throw new Error(termError.message);

  const nameById = new Map((terminals ?? []).map((t) => [t.id, t.name]));
  return rows.map((s) => ({
    ...s,
    terminal_name: nameById.get(s.terminal_id) ?? null,
  }));
}

export async function countTerminalsByVendor(
  ctx: ServerContext,
): Promise<Map<string, number>> {
  const { data, error } = await ctx.db
    .from('terminals')
    .select('current_vendor_id')
    .not('current_vendor_id', 'is', null);
  if (error) throw new Error(error.message);

  const map = new Map<string, number>();
  for (const row of data ?? []) {
    const id = row.current_vendor_id;
    if (!id) continue;
    map.set(id, (map.get(id) ?? 0) + 1);
  }
  return map;
}

export async function countTerminalsByOwner(
  ctx: ServerContext,
): Promise<Map<string, number>> {
  const { data, error } = await ctx.db
    .from('terminals')
    .select('current_owner_id')
    .not('current_owner_id', 'is', null);
  if (error) throw new Error(error.message);

  const map = new Map<string, number>();
  for (const row of data ?? []) {
    const id = row.current_owner_id;
    if (!id) continue;
    map.set(id, (map.get(id) ?? 0) + 1);
  }
  return map;
}

export async function getLatestStatusByTerminalIds(
  ctx: ServerContext,
  terminalIds: string[],
): Promise<Map<string, { terminal_id: string; status: TerminalStatus; recorded_at: string }>> {
  const map = new Map<
    string,
    { terminal_id: string; status: TerminalStatus; recorded_at: string }
  >();
  if (terminalIds.length === 0) return map;

  const { data, error } = await ctx.db
    .from('terminal_status_snapshots')
    .select('terminal_id, status, recorded_at')
    .in('terminal_id', terminalIds)
    .order('recorded_at', { ascending: false });

  if (error) throw new Error(error.message);

  for (const row of data ?? []) {
    if (!map.has(row.terminal_id)) {
      map.set(row.terminal_id, row);
    }
  }
  return map;
}
