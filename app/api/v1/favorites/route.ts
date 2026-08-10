import { NextRequest } from 'next/server';
import { apiError, apiOk } from '@/lib/auth/request';
import { createContext } from '@/lib/server/create-context';
import { isAppError } from '@/lib/server/errors';
import * as favoritesService from '@/lib/server/modules/favorites/favorites.service';

/** GET /api/v1/favorites */
export async function GET(req: NextRequest) {
  try {
    const ctx = await createContext(req);
    const data = await favoritesService.listFavorites(ctx);
    return apiOk(data);
  } catch (err) {
    if (isAppError(err)) return apiError(err.message, err.status);
    return apiError('Failed to list favorites', 500);
  }
}

/** POST /api/v1/favorites — body { terminalId } */
export async function POST(req: NextRequest) {
  try {
    const ctx = await createContext(req);
    const body: unknown = await req.json();
    const data = await favoritesService.addFavorite(ctx, body);
    return apiOk(data, { status: 201 });
  } catch (err) {
    if (isAppError(err)) return apiError(err.message, err.status);
    return apiError('Failed to add favorite', 500);
  }
}
