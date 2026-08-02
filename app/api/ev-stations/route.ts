import { NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { apiError, apiOk } from '@/lib/auth/request';

/** GET /api/ev-stations — Rich list of EV charging stations using view_ev_charging_stations_full */
export async function GET(req: NextRequest) {
  try {
    const city = req.nextUrl.searchParams.get('city');
    const operator = req.nextUrl.searchParams.get('operator');
    const plugType = req.nextUrl.searchParams.get('plug_type');

    let query = supabaseServer()
      .from('view_ev_charging_stations_full')
      .select('*')
      .order('location_name');

    if (city) {
      query = query.eq('city', city);
    }
    if (operator) {
      query = query.eq('network_operator', operator);
    }
    if (plugType) {
      query = query.eq('plug_type', plugType);
    }

    const { data, error } = await query;
    if (error) {
      console.error('[ev-stations GET]', error.message);
      return apiError(error.message, 500);
    }

    return apiOk(data);
  } catch (err) {
    console.error('[ev-stations GET] unexpected', err);
    return apiError('Failed to list EV stations', 500);
  }
}
