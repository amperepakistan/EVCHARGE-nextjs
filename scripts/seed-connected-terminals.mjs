/**
 * Pick ~10 public terminals (evenly across cities) and mark them connected
 * with demo status snapshots so the Flutter "Connected / live status" UI works.
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-connected-terminals.mjs
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const TARGET = 10;
const PREFERRED_CITIES = ['Karachi', 'Lahore', 'Islamabad'];
const STATUSES = [
  { status: 'available', charge_percent: null, kwh_delivered: null },
  { status: 'occupied', charge_percent: 62, kwh_delivered: 18.4 },
  { status: 'available', charge_percent: null, kwh_delivered: null },
  { status: 'occupied', charge_percent: 38, kwh_delivered: 42.1 },
  { status: 'offline', charge_percent: null, kwh_delivered: null },
  { status: 'available', charge_percent: null, kwh_delivered: null },
  { status: 'fault', charge_percent: null, kwh_delivered: null },
  { status: 'available', charge_percent: null, kwh_delivered: null },
  { status: 'occupied', charge_percent: 81, kwh_delivered: 9.2 },
  { status: 'available', charge_percent: null, kwh_delivered: null },
];

/** Even quota per city (e.g. 10 / 3 → 4, 3, 3). */
function quotasForCities(cityCount, total) {
  const base = Math.floor(total / cityCount);
  const rem = total % cityCount;
  return Array.from({ length: cityCount }, (_, i) => base + (i < rem ? 1 : 0));
}

const { data: terminals, error } = await supabase
  .from('terminals')
  .select('id, name, city, connectivity_tier, is_public')
  .eq('is_public', true)
  .order('city')
  .order('name');

if (error) {
  console.error(error.message);
  process.exit(1);
}

if (!terminals?.length) {
  console.error('No public terminals found. Seed stations first.');
  process.exit(1);
}

const byCity = new Map();
for (const t of terminals) {
  const city = (t.city || 'Unknown').trim() || 'Unknown';
  if (!byCity.has(city)) byCity.set(city, []);
  byCity.get(city).push(t);
}

// Prefer the three metros; fall back to any cities with enough rows.
let cities = PREFERRED_CITIES.filter((c) => (byCity.get(c)?.length ?? 0) > 0);
if (cities.length === 0) {
  cities = [...byCity.keys()].sort(
    (a, b) => (byCity.get(b)?.length ?? 0) - (byCity.get(a)?.length ?? 0),
  );
}

// Keep cities that can contribute at least 1; cap to cities we have.
cities = cities.filter((c) => (byCity.get(c)?.length ?? 0) > 0);
const nCities = Math.min(cities.length, TARGET);
cities = cities.slice(0, nCities);

const quotas = quotasForCities(cities.length, TARGET);
const picked = [];

for (let i = 0; i < cities.length; i++) {
  const city = cities[i];
  let want = quotas[i];
  const pool = [...(byCity.get(city) ?? [])];

  // Prefer EV-looking names, de-dupe similar titles, then interleave.
  const score = (t) => {
    const n = (t.name || '').toLowerCase();
    if (/go green|pso electro|electrify|shell recharge|evee|total.*ev|go ev|charging station/.test(n))
      return 0;
    if (/bmw destination|bmw phev|destination charging/.test(n)) return 1;
    if (/battery|mobile|ac service|warehouse|pump|sun.?glasses|opti/.test(n)) return 3;
    return 2;
  };
  pool.sort((a, b) => score(a) - score(b) || (a.name || '').localeCompare(b.name || ''));

  // Drop near-duplicate names so we don't showcase four BMWs from one city.
  const unique = [];
  const seenKeys = new Set();
  for (const t of pool) {
    const key = (t.name || '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/charging station|destination/g, '')
      .trim()
      .slice(0, 28);
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    unique.push(t);
  }

  // Light shuffle of top candidates so re-runs feel random but quality first.
  const top = unique.slice(0, Math.max(want * 3, want));
  for (let j = top.length - 1; j > 0; j--) {
    const k = Math.floor(Math.random() * (j + 1));
    [top[j], top[k]] = [top[k], top[j]];
  }
  const take = top.slice(0, Math.min(want, top.length));
  // If quality pool was thin, fall back to full unique list
  if (take.length < want) {
    for (const t of unique) {
      if (take.length >= want) break;
      if (!take.some((x) => x.id === t.id)) take.push(t);
    }
  }
  picked.push(...take.map((t) => ({ ...t, _city: city })));
}

// If short on quota (small city), top up from remaining pools.
if (picked.length < TARGET) {
  const pickedIds = new Set(picked.map((t) => t.id));
  const rest = terminals.filter((t) => !pickedIds.has(t.id));
  for (const t of rest) {
    if (picked.length >= TARGET) break;
    picked.push({ ...t, _city: t.city || 'Unknown' });
  }
}

const finalPicks = picked.slice(0, TARGET);
const ids = finalPicks.map((t) => t.id);

console.log(`Marking ${ids.length} terminals connected_demo:\n`);
for (const t of finalPicks) {
  console.log(`  [${t._city || t.city}] ${t.name}`);
}

const { error: upErr } = await supabase
  .from('terminals')
  .update({
    connectivity_tier: 'connected_demo',
    verification_status: 'verified',
  })
  .in('id', ids);

if (upErr) {
  console.error('Update failed:', upErr.message);
  process.exit(1);
}

// Replace old demo snapshots for these terminals so re-runs stay clean.
await supabase.from('terminal_status_snapshots').delete().in('terminal_id', ids).eq('source', 'demo');

const snapshots = finalPicks.map((t, i) => {
  const s = STATUSES[i % STATUSES.length];
  return {
    terminal_id: t.id,
    status: s.status,
    charge_percent: s.charge_percent,
    kwh_delivered: s.kwh_delivered,
    source: 'demo',
    recorded_at: new Date().toISOString(),
  };
});

const { error: snapErr } = await supabase
  .from('terminal_status_snapshots')
  .insert(snapshots);

if (snapErr) {
  console.error('Snapshot insert failed:', snapErr.message);
  process.exit(1);
}

// City breakdown
const breakdown = {};
for (const t of finalPicks) {
  const c = t._city || t.city || '?';
  breakdown[c] = (breakdown[c] || 0) + 1;
}
console.log('\nBy city:', breakdown);
console.log('Done. Flutter Connected rail + status badges can use these.');
