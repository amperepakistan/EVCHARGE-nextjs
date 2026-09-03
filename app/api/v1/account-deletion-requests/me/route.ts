import { NextRequest } from 'next/server';
import { apiError, apiOk } from '@/lib/auth/request';
import { createContext } from '@/lib/server/create-context';
import { isAppError } from '@/lib/server/errors';
import * as accountDeletion from '@/lib/server/modules/account-deletion/account-deletion.service';

/** GET /api/v1/account-deletion-requests/me */
export async function GET(req: NextRequest) {
  try {
    const ctx = await createContext(req);
    const data = await accountDeletion.getMyRequest(ctx);
    return apiOk(data);
  } catch (err) {
    if (isAppError(err)) return apiError(err.message, err.status);
    console.error('[v1/account-deletion-requests/me] get unexpected', err);
    return apiError('Failed to load deletion request', 500);
  }
}

/** DELETE /api/v1/account-deletion-requests/me — cancel pending request */
export async function DELETE(req: NextRequest) {
  try {
    const ctx = await createContext(req);
    const data = await accountDeletion.cancelMyRequest(ctx);
    return apiOk(data);
  } catch (err) {
    if (isAppError(err)) return apiError(err.message, err.status);
    console.error('[v1/account-deletion-requests/me] cancel unexpected', err);
    return apiError('Failed to cancel deletion request', 500);
  }
}
