import type { ServerContext } from '@/lib/server/context';
import { AppError } from '@/lib/server/errors';
import * as authRepo from '@/lib/server/modules/auth/auth.repository';
import * as driversAdminRepo from '@/lib/server/modules/admin/drivers-admin.repository';
import {
  adminResetPasswordSchema,
  adminUpdateEmailSchema,
} from '@/lib/server/modules/admin/drivers-admin.schema';

function requirePlatformAdmin(ctx: ServerContext) {
  if (!ctx.user) throw new AppError(401, 'Unauthorized');
  if (ctx.user.role !== 'super_admin' && ctx.user.role !== 'staff') {
    throw new AppError(403, 'Forbidden');
  }
  return ctx.user;
}

export async function listDrivers(ctx: ServerContext) {
  requirePlatformAdmin(ctx);
  try {
    return await driversAdminRepo.listDrivers(ctx);
  } catch (err) {
    if (err instanceof AppError) throw err;
    ctx.logger.error('[admin/drivers] list failed', {
      message: err instanceof Error ? err.message : String(err),
    });
    throw new AppError(500, err instanceof Error ? err.message : 'Failed to list drivers');
  }
}

export async function getDriver(ctx: ServerContext, driverId: string) {
  requirePlatformAdmin(ctx);
  try {
    const driver = await driversAdminRepo.getDriverDetail(ctx, driverId);
    if (!driver) throw new AppError(404, 'Driver not found');
    return driver;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, err instanceof Error ? err.message : 'Failed to load driver');
  }
}

export async function resetDriverPassword(
  ctx: ServerContext,
  driverId: string,
  password: string,
) {
  requirePlatformAdmin(ctx);
  const parsed = adminResetPasswordSchema.safeParse({ password });
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? 'Invalid password');
  }

  try {
    const userId = await driversAdminRepo.findDriverUserId(ctx, driverId);
    if (!userId) throw new AppError(404, 'Driver account has no linked user');
    await authRepo.updateUserPassword(userId, parsed.data.password);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, err instanceof Error ? err.message : 'Failed to reset password');
  }
}

export async function updateDriverEmail(
  ctx: ServerContext,
  driverId: string,
  email: string,
) {
  requirePlatformAdmin(ctx);
  const parsed = adminUpdateEmailSchema.safeParse({ email });
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? 'Invalid email');
  }

  const normalized = parsed.data.email.trim().toLowerCase();

  try {
    const userId = await driversAdminRepo.findDriverUserId(ctx, driverId);
    if (!userId) throw new AppError(404, 'Driver account has no linked user');

    const taken = await authRepo.isEmailTaken(normalized, userId);
    if (taken) throw new AppError(409, 'Email already in use');

    await driversAdminRepo.updateDriverEmailRows(ctx, driverId, userId, normalized);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, err instanceof Error ? err.message : 'Failed to update email');
  }
}
