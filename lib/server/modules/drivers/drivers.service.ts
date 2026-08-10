import type { ServerContext } from '@/lib/server/context';
import { AppError } from '@/lib/server/errors';
import * as driversRepo from '@/lib/server/modules/drivers/drivers.repository';
import {
  patchDriverSchema,
} from '@/lib/server/modules/drivers/drivers.schema';

function requireAuth(ctx: ServerContext) {
  if (!ctx.user) throw new AppError(401, 'Unauthorized');
  return ctx.user;
}

export async function getMyDriverProfile(ctx: ServerContext) {
  const user = requireAuth(ctx);
  try {
    const profile = await driversRepo.findDriverByUserId(ctx, user.userId);
    // Vendor/owner logins may have no drivers row — return null
    return profile;
  } catch (err) {
    throw new AppError(500, err instanceof Error ? err.message : 'Failed to load driver');
  }
}

export async function patchMyDriverProfile(ctx: ServerContext, raw: unknown) {
  const user = requireAuth(ctx);
  const parsed = patchDriverSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? 'Invalid body');
  }

  try {
    const existing = await driversRepo.findDriverByUserId(ctx, user.userId);
    if (!existing) {
      throw new AppError(404, 'Driver profile not found');
    }
    return await driversRepo.updateDriverForUser(ctx, user.userId, parsed.data);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, err instanceof Error ? err.message : 'Failed to update driver');
  }
}
