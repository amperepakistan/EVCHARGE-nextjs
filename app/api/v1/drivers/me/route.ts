import { NextRequest } from 'next/server';
import { apiError, apiOk } from '@/lib/auth/request';
import { createContext } from '@/lib/server/create-context';
import { isAppError } from '@/lib/server/errors';
import * as driversService from '@/lib/server/modules/drivers/drivers.service';

/** GET /api/v1/drivers/me */
export async function GET(req: NextRequest) {
  try {
    const ctx = await createContext(req);
    const driver = await driversService.getMyDriverProfile(ctx);
    if (!driver) return apiError('Driver profile not found', 404);
    return apiOk(driver);
  } catch (err) {
    if (isAppError(err)) return apiError(err.message, err.status);
    return apiError('Failed to load driver', 500);
  }
}

/** PATCH /api/v1/drivers/me */
export async function PATCH(req: NextRequest) {
  try {
    const ctx = await createContext(req);
    const body: unknown = await req.json();
    const driver = await driversService.patchMyDriverProfile(ctx, body);
    return apiOk(driver);
  } catch (err) {
    if (isAppError(err)) return apiError(err.message, err.status);
    return apiError('Failed to update driver', 500);
  }
}
