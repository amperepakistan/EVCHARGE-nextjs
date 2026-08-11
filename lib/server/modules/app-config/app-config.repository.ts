import type { ServerContext } from '@/lib/server/context';
import type { AppPlatform, Tables } from '@/types/database.types';

export type AppConfigRow = Tables<'app_config'>;
export type AppMaintenanceRow = Tables<'app_maintenance'>;

export async function listPlatformConfigs(ctx: ServerContext): Promise<AppConfigRow[]> {
  const { data, error } = await ctx.db.from('app_config').select('*').order('platform');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getMaintenance(ctx: ServerContext): Promise<AppMaintenanceRow | null> {
  const { data, error } = await ctx.db.from('app_maintenance').select('*').eq('id', true).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function upsertPlatformConfig(
  ctx: ServerContext,
  platform: AppPlatform,
  patch: Omit<AppConfigRow, 'platform' | 'updated_at'>,
): Promise<AppConfigRow> {
  const { data, error } = await ctx.db
    .from('app_config')
    .update(patch)
    .eq('platform', platform)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function upsertMaintenance(
  ctx: ServerContext,
  patch: Omit<AppMaintenanceRow, 'id' | 'updated_at'>,
): Promise<AppMaintenanceRow> {
  const { data, error } = await ctx.db
    .from('app_maintenance')
    .update(patch)
    .eq('id', true)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data;
}
