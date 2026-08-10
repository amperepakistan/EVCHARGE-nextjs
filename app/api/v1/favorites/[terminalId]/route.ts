import { NextRequest } from 'next/server';
import { apiError, apiOk } from '@/lib/auth/request';
import { createContext } from '@/lib/server/create-context';
import { isAppError } from '@/lib/server/errors';
import * as favoritesService from '@/lib/server/modules/favorites/favorites.service';

type RouteContext = { params: Promise<{ terminalId: string }> };

/** DELETE /api/v1/favorites/:terminalId */
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const ctx = await createContext(req);
    const { terminalId } = await context.params;
    const data = await favoritesService.removeFavorite(ctx, terminalId);
    return apiOk(data);
  } catch (err) {
    if (isAppError(err)) return apiError(err.message, err.status);
    return apiError('Failed to remove favorite', 500);
  }
}
