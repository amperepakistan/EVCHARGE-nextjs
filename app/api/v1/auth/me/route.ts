import { NextRequest } from 'next/server';
import { apiError, apiOk } from '@/lib/auth/request';
import { createContext } from '@/lib/server/create-context';
import { isAppError } from '@/lib/server/errors';
import { getMe } from '@/lib/server/modules/auth/auth.service';
import * as driversService from '@/lib/server/modules/drivers/drivers.service';

/** GET /api/v1/auth/me — current user + driver profile from Bearer/cookie. */
export async function GET(req: NextRequest) {
  try {
    const ctx = await createContext(req);
    const user = await getMe(ctx);
    const driver = await driversService.getMyDriverProfile(ctx);
    return apiOk({ user, driver });
  } catch (err) {
    if (isAppError(err)) {
      return apiError(err.message, err.status);
    }
    console.error('[v1/auth/me] unexpected', err);
    return apiError('Unable to load session', 500);
  }
}
