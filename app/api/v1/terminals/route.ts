import { NextRequest } from 'next/server';
import { apiError, apiOk } from '@/lib/auth/request';
import { createContext } from '@/lib/server/create-context';
import { isAppError } from '@/lib/server/errors';
import * as terminalsService from '@/lib/server/modules/terminals/terminals.service';

/** GET /api/v1/terminals — public list of public terminals. */
export async function GET(req: NextRequest) {
  try {
    const ctx = await createContext(req);
    const city = req.nextUrl.searchParams.get('city');
    const data = await terminalsService.listTerminals(ctx, city);
    return apiOk(data);
  } catch (err) {
    if (isAppError(err)) {
      return apiError(err.message, err.status);
    }
    console.error('[v1/terminals GET] unexpected', err);
    return apiError('Failed to list terminals', 500);
  }
}

/** POST /api/v1/terminals — create (super_admin, staff, or vendor). */
export async function POST(req: NextRequest) {
  try {
    const ctx = await createContext(req);
    const body: unknown = await req.json();
    const data = await terminalsService.createTerminal(ctx, body);
    return apiOk(data, { status: 201 });
  } catch (err) {
    if (isAppError(err)) {
      return apiError(err.message, err.status);
    }
    console.error('[v1/terminals POST] unexpected', err);
    return apiError('Failed to create terminal', 500);
  }
}
