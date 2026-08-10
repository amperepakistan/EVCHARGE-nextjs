import {
  getAdminOwnerIdFromCookies,
  getAdminVendorIdFromCookies,
} from '@/lib/auth/admin-scope';
import type { ServerContext } from '@/lib/server/context';
import { AppError } from '@/lib/server/errors';
import * as tenancyRepo from '@/lib/server/modules/tenancy/tenancy.repository';
import type { OwnerScope, VendorScope } from '@/lib/server/modules/tenancy/tenancy.repository';

function isPlatformAdmin(role: string) {
  return role === 'super_admin' || role === 'staff';
}

/**
 * Resolve vendor tenant from membership.
 * Platform admins may override via the admin vendor drill-in cookie.
 */
export async function resolveVendorScope(ctx: ServerContext): Promise<VendorScope> {
  if (!ctx.user) {
    throw new AppError(401, 'Unauthorized');
  }

  try {
    if (isPlatformAdmin(ctx.user.role)) {
      const adminVendorId = await getAdminVendorIdFromCookies();
      if (!adminVendorId) {
        throw new AppError(
          403,
          'Select a vendor from Admin → Vendors to open their dashboard.',
        );
      }
      const exists = await tenancyRepo.vendorExists(ctx, adminVendorId);
      if (!exists) {
        throw new AppError(403, 'Selected vendor no longer exists');
      }
      return {
        userId: ctx.user.userId,
        role: ctx.user.role,
        vendorId: adminVendorId,
      };
    }

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
 * Resolve owner tenant from membership.
 * Platform admins may override via the admin owner drill-in cookie.
 */
export async function resolveOwnerScope(ctx: ServerContext): Promise<OwnerScope> {
  if (!ctx.user) {
    throw new AppError(401, 'Unauthorized');
  }

  try {
    if (isPlatformAdmin(ctx.user.role)) {
      const adminOwnerId = await getAdminOwnerIdFromCookies();
      if (!adminOwnerId) {
        throw new AppError(
          403,
          'Select an owner from Admin → Owners to open their dashboard.',
        );
      }
      const exists = await tenancyRepo.ownerExists(ctx, adminOwnerId);
      if (!exists) {
        throw new AppError(403, 'Selected owner no longer exists');
      }
      return {
        userId: ctx.user.userId,
        role: ctx.user.role,
        ownerId: adminOwnerId,
      };
    }

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
