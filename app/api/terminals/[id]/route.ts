import { NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { updateTerminalSchema } from '@/lib/validations/terminal';
import { toTerminalUpdate } from '@/lib/utils/terminal-mapper';
import { apiError, apiOk, isAuthError, requireAuth } from '@/lib/auth/request';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { data, error } = await supabaseServer()
      .from('terminals')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('[terminals/:id GET]', error.message);
      return apiError(error.message, 500);
    }
    if (!data) {
      return apiError('Terminal not found', 404);
    }

    return apiOk(data);
  } catch (err) {
    console.error('[terminals/:id GET] unexpected', err);
    return apiError('Failed to fetch terminal', 500);
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const auth = await requireAuth(req, ['super_admin', 'staff', 'vendor']);
  if (isAuthError(auth)) return auth;

  try {
    const { id } = await context.params;
    const body: unknown = await req.json();
    const parsed = updateTerminalSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? 'Invalid body', 400);
    }

    const { data, error } = await supabaseServer()
      .from('terminals')
      .update(toTerminalUpdate(parsed.data))
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('[terminals/:id PATCH]', { role: auth.role, message: error.message });
      return apiError(error.message, 500);
    }
    if (!data) {
      return apiError('Terminal not found', 404);
    }

    return apiOk(data);
  } catch (err) {
    console.error('[terminals/:id PATCH] unexpected', err);
    return apiError('Failed to update terminal', 500);
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const auth = await requireAuth(req, ['super_admin', 'staff']);
  if (isAuthError(auth)) return auth;

  try {
    const { id } = await context.params;
    const { error } = await supabaseServer().from('terminals').delete().eq('id', id);

    if (error) {
      console.error('[terminals/:id DELETE]', { role: auth.role, message: error.message });
      return apiError(error.message, 500);
    }

    return apiOk({ id });
  } catch (err) {
    console.error('[terminals/:id DELETE] unexpected', err);
    return apiError('Failed to delete terminal', 500);
  }
}
