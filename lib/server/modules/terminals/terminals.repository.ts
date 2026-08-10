import type { ServerContext } from '@/lib/server/context';
import type { CreateTerminalInput, UpdateTerminalInput } from '@/lib/server/modules/terminals/terminals.schema';
import { toTerminalInsert, toTerminalUpdate } from '@/lib/utils/terminal-mapper';

const PUBLIC_LIST_COLUMNS =
  'id, name, latitude, longitude, city, address, connector_type, charger_class, power_kw, price_per_kwh, operating_hours, phone_number, connectivity_tier, verification_status, google_place_id, google_maps_url, google_rating, google_rating_count, google_photo_urls, is_public';

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

export async function getTerminalById(ctx: ServerContext, id: string) {
  const { data, error } = await ctx.db.from('terminals').select('*').eq('id', id).maybeSingle();
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
