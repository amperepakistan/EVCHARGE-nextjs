import { NextRequest } from 'next/server';
import { apiError, apiOk } from '@/lib/auth/request';
import { createContext } from '@/lib/server/create-context';
import { isAppError } from '@/lib/server/errors';
import * as accountDeletion from '@/lib/server/modules/account-deletion/account-deletion.service';

/** POST /api/v1/account-deletion-requests — body { reason? } */
export async function POST(req: NextRequest) {
  try {
    const ctx = await createContext(req);
    let body: unknown = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    const data = await accountDeletion.createMyRequest(ctx, body);
    return apiOk(data, { status: 201 });
  } catch (err) {
    if (isAppError(err)) return apiError(err.message, err.status);
    console.error('[v1/account-deletion-requests] create unexpected', err);
    return apiError('Failed to create deletion request', 500);
  }
}
