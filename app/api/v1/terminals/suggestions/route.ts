import { NextRequest } from 'next/server';
import { apiError, apiOk } from '@/lib/auth/request';
import { createContext } from '@/lib/server/create-context';
import { isAppError } from '@/lib/server/errors';
import * as terminalsService from '@/lib/server/modules/terminals/terminals.service';

/** POST /api/v1/terminals/suggestions — driver scout a missing charger. */
export async function POST(req: NextRequest) {
  try {
    const ctx = await createContext(req);
    const body: unknown = await req.json();
    const data = await terminalsService.suggestTerminal(ctx, body);
    return apiOk(data, { status: 201 });
  } catch (err) {
    if (isAppError(err)) {
      return apiError(err.message, err.status);
    }
    console.error('[v1/terminals/suggestions POST] unexpected', err);
    return apiError('Failed to submit station', 500);
  }
}
