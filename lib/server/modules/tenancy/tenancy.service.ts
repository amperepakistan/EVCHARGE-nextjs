import type { ServerContext } from '@/lib/server/context';
import { AppError } from '@/lib/server/errors';
import * as tenancyRepo from '@/lib/server/modules/tenancy/tenancy.repository';
import type { OwnerScope, VendorScope } from '@/lib/server/modules/tenancy/tenancy.repository';

/**
 * Resolve vendor tenant from membership. No demo fallback —
 * missing membership is an error.
 */
export async function resolveVendorScope(ctx: ServerContext): Promise<VendorScope> {
  if (!ctx.user) {
    throw new AppError(401, 'Unauthorized');
  }

  try {
    const vendorId = await tenancyRepo.findVendorIdForUser(ctx, ctx.user.userId);
    if (!vendorId) {
      throw new AppError(403, 'No vendor membership for this account');
    }
    return {
      userId: ctx.user.userId,
      role: ctx.user.role,
      vendorId,
    };
  } catch (err) {
    if (err instanceof AppError) throw err;
    ctx.logger.error('[tenancy] vendor scope failed', {
      message: err instanceof Error ? err.message : String(err),
    });
    throw new AppError(500, 'Failed to resolve vendor scope');
  }
}

/**
 * Resolve owner tenant from membership. No demo fallback —
 * missing membership is an error.
 */
export async function resolveOwnerScope(ctx: ServerContext): Promise<OwnerScope> {
  if (!ctx.user) {
    throw new AppError(401, 'Unauthorized');
  }

  try {
    const ownerId = await tenancyRepo.findOwnerIdForUser(ctx, ctx.user.userId);
    if (!ownerId) {
      throw new AppError(403, 'No owner membership for this account');
    }
    return {
      userId: ctx.user.userId,
      role: ctx.user.role,
      ownerId,
    };
  } catch (err) {
    if (err instanceof AppError) throw err;
    ctx.logger.error('[tenancy] owner scope failed', {
      message: err instanceof Error ? err.message : String(err),
    });
    throw new AppError(500, 'Failed to resolve owner scope');
  }
}
