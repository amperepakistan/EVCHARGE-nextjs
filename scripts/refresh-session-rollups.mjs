/**
 * Refresh session_daily_rollups from charging_sessions.
 *
 * Usage:
 *   node --env-file=.env.local scripts/refresh-session-rollups.mjs
 *   node --env-file=.env.local scripts/refresh-session-rollups.mjs 2026-01-01 2026-08-10
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const fromDay = process.argv[2] ?? undefined;
const toDay = process.argv[3] ?? undefined;

const supabase = createClient(url, key, { auth: { persistSession: false } });

const args = {};
if (fromDay) args.p_from_day = fromDay;
if (toDay) args.p_to_day = toDay;

const { error } = await supabase.rpc('refresh_session_daily_rollups', args);

if (error) {
  console.error('refresh_session_daily_rollups failed:', error.message);
  process.exit(1);
}

console.log(
  'session_daily_rollups refreshed',
  fromDay || toDay ? `(${fromDay ?? 'default'} → ${toDay ?? 'default'})` : '(last 90 days → today)',
);
