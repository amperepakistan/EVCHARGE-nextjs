import { NextRequest } from 'next/server';
import { apiError, apiOk } from '@/lib/auth/request';
import { createContext } from '@/lib/server/create-context';
import { isAppError } from '@/lib/server/errors';
import * as terminalsService from '@/lib/server/modules/terminals/terminals.service';

type RouteContext = { params: Promise<{ id: string }> };

/** GET /api/v1/terminals/:id */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const ctx = await createContext(req);
    const { id } = await context.params;
    const data = await terminalsService.getTerminal(ctx, id);
    return apiOk(data);
  } catch (err) {
    if (isAppError(err)) {
      return apiError(err.message, err.status);
    }
    console.error('[v1/terminals/:id GET] unexpected', err);
    return apiError('Failed to fetch terminal', 500);
  }
}

/** PATCH /api/v1/terminals/:id */
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const ctx = await createContext(req);
    const { id } = await context.params;
    const body: unknown = await req.json();
    const data = await terminalsService.updateTerminal(ctx, id, body);
    return apiOk(data);
  } catch (err) {
    if (isAppError(err)) {
      return apiError(err.message, err.status);
    }
    console.error('[v1/terminals/:id PATCH] unexpected', err);
    return apiError('Failed to update terminal', 500);
  }
}

/** DELETE /api/v1/terminals/:id */
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const ctx = await createContext(req);
    const { id } = await context.params;
    const data = await terminalsService.deleteTerminal(ctx, id);
    return apiOk(data);
  } catch (err) {
    if (isAppError(err)) {
      return apiError(err.message, err.status);
    }
    console.error('[v1/terminals/:id DELETE] unexpected', err);
    return apiError('Failed to delete terminal', 500);
  }
}
