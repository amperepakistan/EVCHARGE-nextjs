import { NextRequest } from 'next/server';
import { apiError, apiOk } from '@/lib/auth/request';
import { createContext } from '@/lib/server/create-context';
import { isAppError } from '@/lib/server/errors';
import * as driversService from '@/lib/server/modules/drivers/drivers.service';

/** POST /api/v1/drivers/me/profile-image — multipart/form-data, field "file". */
export async function POST(req: NextRequest) {
  try {
    const ctx = await createContext(req);
    const form = await req.formData();
    const file = form.get('file');

    if (!(file instanceof File)) {
      return apiError('file is required', 400);
    }

    const driver = await driversService.uploadMyProfileImage(ctx, file);
    return apiOk(driver);
  } catch (err) {
    if (isAppError(err)) return apiError(err.message, err.status);
    console.error('[v1/drivers/me/profile-image] unexpected', err);
    return apiError('Failed to upload profile image', 500);
  }
}
