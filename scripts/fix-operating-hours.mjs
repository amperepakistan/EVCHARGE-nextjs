/**
 * Backfill terminals.operating_hours: convert Google Maps JSON arrays and
 * empty "[]" into short human-readable strings.
 *
 * Usage:
 *   node --env-file=.env.local scripts/fix-operating-hours.mjs
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

function formatOpeningHours(openingHours) {
  if (!openingHours) return null;
  if (typeof openingHours === 'string') {
    const t = openingHours.trim();
    if (!t || t === '[]' || t === 'null' || t === '{}') return null;
    if (!t.startsWith('[')) {
      if (/^(open\s*24\s*hours|24\s*hours|24h)$/i.test(t)) return '24/7';
      return t;
    }
    try {
      return formatOpeningHours(JSON.parse(t));
    } catch {
      return t;
    }
  }
  if (!Array.isArray(openingHours) || openingHours.length === 0) return null;

  const days = openingHours
    .map((d) => ({
      day: String(d.day || d.Day || '').trim(),
      hours: String(d.hours || d.Hours || '').trim(),
    }))
    .filter((d) => d.day || d.hours);

  if (!days.length) return null;

  const norms = days.map((d) => d.hours.toLowerCase().replace(/\s+/g, ' ').trim());
  if (norms.every((h) => h === norms[0])) {
    const h = days[0].hours;
    if (/open\s*24|24\s*hours|24\/7/i.test(h)) return '24/7';
    if (/^closed$/i.test(h)) return 'Closed';
    return h;
  }

  const short = (day) =>
    ({
      monday: 'Mon',
      tuesday: 'Tue',
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun',
    })[day.toLowerCase()] || day.slice(0, 3);

  const weekdays = days.filter((d) =>
    ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(
      d.day.toLowerCase(),
    ),
  );
  if (
    weekdays.length === 5 &&
    weekdays.every((d) => d.hours === weekdays[0].hours)
  ) {
    const weekend = days.filter((d) =>
      ['saturday', 'sunday'].includes(d.day.toLowerCase()),
    );
    return [
      `Mon–Fri ${weekdays[0].hours}`,
      ...weekend.map((d) => `${short(d.day)} ${d.hours}`),
    ].join(' · ');
  }

  return days.map((d) => `${short(d.day)} ${d.hours}`).join(' · ');
}

const { data: rows, error } = await supabase
  .from('terminals')
  .select('id, name, operating_hours');

if (error) {
  console.error(error.message);
  process.exit(1);
}

let updated = 0;
let unchanged = 0;

for (const row of rows ?? []) {
  const next = formatOpeningHours(row.operating_hours) || 'Hours not listed';
  if (next === row.operating_hours) {
    unchanged++;
    continue;
  }
  const { error: upErr } = await supabase
    .from('terminals')
    .update({ operating_hours: next })
    .eq('id', row.id);
  if (upErr) {
    console.error(`Failed ${row.name}:`, upErr.message);
    continue;
  }
  updated++;
  console.log(`${row.name}: ${String(row.operating_hours).slice(0, 40)} → ${next}`);
}

console.log(`\nUpdated ${updated}, unchanged ${unchanged}`);
