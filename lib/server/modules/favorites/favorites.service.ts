import type { ServerContext } from '@/lib/server/context';
import { AppError } from '@/lib/server/errors';
import * as favoritesRepo from '@/lib/server/modules/favorites/favorites.repository';
import { addFavoriteSchema } from '@/lib/server/modules/favorites/favorites.schema';

function requireAuth(ctx: ServerContext) {
  if (!ctx.user) throw new AppError(401, 'Unauthorized');
  return ctx.user;
}

export async function listFavorites(ctx: ServerContext) {
  const user = requireAuth(ctx);
  try {
    const terminalIds = await favoritesRepo.listFavoriteTerminalIds(ctx, user.userId);
    return { terminalIds };
  } catch (err) {
    throw new AppError(500, err instanceof Error ? err.message : 'Failed to list favorites');
  }
}

export async function addFavorite(ctx: ServerContext, raw: unknown) {
  const user = requireAuth(ctx);
  const parsed = addFavoriteSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? 'Invalid body');
  }

  try {
    const terminalId = await favoritesRepo.addFavorite(
      ctx,
      user.userId,
      parsed.data.terminalId,
    );
    return { terminalId };
  } catch (err) {
    throw new AppError(500, err instanceof Error ? err.message : 'Failed to add favorite');
  }
}

export async function removeFavorite(ctx: ServerContext, terminalId: string) {
  const user = requireAuth(ctx);
  if (!terminalId) throw new AppError(400, 'terminalId required');

  try {
    await favoritesRepo.removeFavorite(ctx, user.userId, terminalId);
    return { terminalId };
  } catch (err) {
    throw new AppError(500, err instanceof Error ? err.message : 'Failed to remove favorite');
  }
}
