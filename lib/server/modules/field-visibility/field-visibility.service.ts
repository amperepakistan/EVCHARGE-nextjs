import type { ServerContext } from '@/lib/server/context';
import { AppError } from '@/lib/server/errors';
import * as visibilityRepo from '@/lib/server/modules/field-visibility/field-visibility.repository';

export async function canOwnerSee(
  ctx: ServerContext,
  ownerId: string,
  fieldKey: string,
): Promise<boolean> {
  // Platform admins always see owner fields when drilling into a tenant.
  if (ctx.user?.role === 'super_admin' || ctx.user?.role === 'staff') {
    return true;
  }

  try {
    return await visibilityRepo.resolveFieldVisibility(ctx, 'owner', ownerId, fieldKey);
  } catch (err) {
    ctx.logger.error('[field-visibility] resolve failed', {
      message: err instanceof Error ? err.message : String(err),
    });
    throw new AppError(500, 'Failed to resolve field visibility');
  }
}
