import type { ServerContext } from '@/lib/server/context';
import { AppError } from '@/lib/server/errors';
import * as sessionsRepo from '@/lib/server/modules/sessions/sessions.repository';

export async function listOwnerSessions(ctx: ServerContext, ownerId: string) {
  try {
    return await sessionsRepo.listSessionsForOwner(ctx, ownerId);
  } catch (err) {
    ctx.logger.error('[sessions] list failed', {
      message: err instanceof Error ? err.message : String(err),
    });
    throw new AppError(500, err instanceof Error ? err.message : 'Failed to list sessions');
  }
}

export async function ownerHourlyUsage(ctx: ServerContext, ownerId: string, days = 7) {
  try {
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - days);
    return await sessionsRepo.hourlySessionCountsForOwner(ctx, ownerId, since.toISOString());
  } catch (err) {
    ctx.logger.error('[sessions] hourly failed', {
      message: err instanceof Error ? err.message : String(err),
    });
    throw new AppError(500, err instanceof Error ? err.message : 'Failed to load hourly usage');
  }
}
