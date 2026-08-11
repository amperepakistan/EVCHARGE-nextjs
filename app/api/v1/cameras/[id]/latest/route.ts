import { NextRequest } from 'next/server';
import { apiError, apiOk } from '@/lib/auth/request';
import { createContext } from '@/lib/server/create-context';
import { isAppError } from '@/lib/server/errors';
import * as camerasService from '@/lib/server/modules/cameras/cameras.service';

type RouteContext = { params: Promise<{ id: string }> };

/** GET /api/v1/cameras/:id/latest */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const ctx = await createContext(req);
    const { id } = await context.params;
    const data = await camerasService.getCameraLatest(ctx, id);
    return apiOk(data);
  } catch (err) {
    if (isAppError(err)) return apiError(err.message, err.status);
    console.error('[v1/cameras/:id/latest] unexpected', err);
    return apiError('Failed to fetch camera', 500);
  }
}
