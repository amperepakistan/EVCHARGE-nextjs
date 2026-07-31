import { NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { createTerminalSchema } from '@/lib/validations/terminal';
import { toTerminalInsert } from '@/lib/utils/terminal-mapper';
import { apiError, apiOk, isAuthError, requireAuth } from '@/lib/auth/request';

/** GET /api/terminals — public list of public terminals (Flutter map). Auth optional for scoped lists later. */
export async function GET(req: NextRequest) {
  try {
    const city = req.nextUrl.searchParams.get('city');
    let query = supabaseServer()
      .from('terminals')
      .select(
        'id, name, latitude, longitude, city, address, connector_type, charger_class, power_kw, price_per_kwh, operating_hours, phone_number, connectivity_tier, verification_status, google_place_id, google_maps_url, google_rating, google_rating_count, google_photo_urls, is_public',
      )
      .eq('is_public', true)
      .order('name');

    if (city) {
      query = query.eq('city', city);
    }

    const { data, error } = await query;
    if (error) {
      console.error('[terminals GET]', error.message);
      return apiError(error.message, 500);
    }

    return apiOk(data);
  } catch (err) {
    console.error('[terminals GET] unexpected', err);
    return apiError('Failed to list terminals', 500);
  }
}

/** POST /api/terminals — create (super_admin or vendor). */
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ['super_admin', 'staff', 'vendor']);
  if (isAuthError(auth)) return auth;

  try {
    const body: unknown = await req.json();
    const parsed = createTerminalSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? 'Invalid body', 400);
    }

    const insert = toTerminalInsert({
      ...parsed.data,
      source: parsed.data.source ?? 'manual',
    });

    const { data, error } = await supabaseServer()
      .from('terminals')
      .insert(insert)
      .select()
      .single();

    if (error) {
      console.error('[terminals POST]', { role: auth.role, message: error.message });
      return apiError(error.message, 500);
    }

    return apiOk(data, { status: 201 });
  } catch (err) {
    console.error('[terminals POST] unexpected', err);
    return apiError('Failed to create terminal', 500);
  }
}
