import type { ServerContext } from '@/lib/server/context';
import { AppError } from '@/lib/server/errors';
import * as camerasRepo from '@/lib/server/modules/cameras/cameras.repository';

function requireAuth(ctx: ServerContext) {
  if (!ctx.user) throw new AppError(401, 'Unauthorized');
  return ctx.user;
}

export async function listCamerasForTerminal(ctx: ServerContext, terminalId: string) {
  requireAuth(ctx);
  try {
    return await camerasRepo.listCamerasForTerminal(ctx, terminalId);
  } catch (err) {
    ctx.logger.error('[cameras] list for terminal failed', {
      message: err instanceof Error ? err.message : String(err),
    });
    throw new AppError(500, err instanceof Error ? err.message : 'Failed to list cameras');
  }
}

export async function getCameraLatest(ctx: ServerContext, cameraId: string) {
  requireAuth(ctx);
  try {
    const camera = await camerasRepo.getCameraById(ctx, cameraId);
    if (!camera) throw new AppError(404, 'Camera not found');
    return {
      id: camera.id,
      online: camera.online,
      snapshotUrl: camera.snapshotUrl,
      lastSeenAt: camera.lastSeenAt,
    };
  } catch (err) {
    if (err instanceof AppError) throw err;
    ctx.logger.error('[cameras] get latest failed', {
      message: err instanceof Error ? err.message : String(err),
    });
    throw new AppError(500, err instanceof Error ? err.message : 'Failed to fetch camera');
  }
}
