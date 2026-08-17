import { NextRequest } from 'next/server';
import { apiError, apiOk } from '@/lib/auth/request';
import { createContext } from '@/lib/server/create-context';
import { isAppError } from '@/lib/server/errors';
import * as vehiclesService from '@/lib/server/modules/vehicles/vehicles.service';

/** GET /api/v1/vehicles — public Pakistan EV catalog. */
export async function GET(req: NextRequest) {
  try {
    const ctx = await createContext(req);
    const data = await vehiclesService.listCatalog(ctx);
    return apiOk(data);
  } catch (err) {
    if (isAppError(err)) return apiError(err.message, err.status);
    console.error('[v1/vehicles GET] unexpected', err);
    return apiError('Failed to list vehicles', 500);
  }
}
