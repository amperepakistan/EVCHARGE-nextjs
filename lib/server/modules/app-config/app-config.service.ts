import type { ServerContext } from '@/lib/server/context';
import { AppError } from '@/lib/server/errors';
import type { AppPlatform } from '@/types/database.types';
import * as appConfigRepo from '@/lib/server/modules/app-config/app-config.repository';
import {
  updateMaintenanceSchema,
  updatePlatformConfigSchema,
  type UpdateMaintenanceInput,
  type UpdatePlatformConfigInput,
} from '@/lib/server/modules/app-config/app-config.schema';

function requirePlatformAdmin(ctx: ServerContext) {
  if (!ctx.user) throw new AppError(401, 'Unauthorized');
  if (ctx.user.role !== 'super_admin' && ctx.user.role !== 'staff') {
    throw new AppError(403, 'Forbidden');
  }
  return ctx.user;
}

/** Console view: both platform configs + maintenance switch. Admin-only (§8/§23 platform config, feature-roles.md). */
export async function getConsole(ctx: ServerContext) {
  requirePlatformAdmin(ctx);
  try {
    const [configs, maintenance] = await Promise.all([
      appConfigRepo.listPlatformConfigs(ctx),
      appConfigRepo.getMaintenance(ctx),
    ]);
    return { configs, maintenance };
  } catch (err) {
    if (err instanceof AppError) throw err;
    ctx.logger.error('[app-config] console failed', {
      message: err instanceof Error ? err.message : String(err),
    });
    throw new AppError(500, 'Failed to load app config');
  }
}

export async function updatePlatformConfig(
  ctx: ServerContext,
  platform: AppPlatform,
  input: unknown,
) {
  const user = requirePlatformAdmin(ctx);
  const parsed = updatePlatformConfigSchema.safeParse(input);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? 'Invalid input');
  }
  const value: UpdatePlatformConfigInput = parsed.data;

  try {
    return await appConfigRepo.upsertPlatformConfig(ctx, platform, {
      min_version: value.minVersion,
      min_build_number: value.minBuildNumber,
      latest_version: value.latestVersion,
      latest_build_number: value.latestBuildNumber,
      force_update: value.forceUpdate,
      store_url: value.storeUrl ? value.storeUrl : null,
      updated_by: user.userId,
    });
  } catch (err) {
    if (err instanceof AppError) throw err;
    ctx.logger.error('[app-config] update platform config failed', {
      message: err instanceof Error ? err.message : String(err),
      platform,
    });
    throw new AppError(500, 'Failed to update app config');
  }
}

export async function updateMaintenance(ctx: ServerContext, input: unknown) {
  const user = requirePlatformAdmin(ctx);
  const parsed = updateMaintenanceSchema.safeParse(input);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? 'Invalid input');
  }
  const value: UpdateMaintenanceInput = parsed.data;

  try {
    return await appConfigRepo.upsertMaintenance(ctx, {
      enabled: value.enabled,
      message: value.message ? value.message : null,
      starts_at: value.enabled ? new Date().toISOString() : null,
      ends_at: null,
      updated_by: user.userId,
    });
  } catch (err) {
    if (err instanceof AppError) throw err;
    ctx.logger.error('[app-config] update maintenance failed', {
      message: err instanceof Error ? err.message : String(err),
    });
    throw new AppError(500, 'Failed to update maintenance mode');
  }
}
