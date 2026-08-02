/**
 * Seed / upsert terminals from a JSON file (scraped Google Places, OCM, manual).
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-terminals.mjs path/to/terminals.json
 *
 * JSON shape: array of objects matching DB columns (snake_case) or camelCase aliases.
 * Upserts on google_place_id when present; otherwise inserts new rows.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node --env-file=.env.local scripts/seed-terminals.mjs <terminals.json>');
  process.exit(1);
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const raw = JSON.parse(readFileSync(resolve(filePath), 'utf8'));
if (!Array.isArray(raw)) {
  console.error('JSON root must be an array');
  process.exit(1);
}

function pick(obj, ...keys) {
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null && obj[k] !== '') return obj[k];
  }
  return undefined;
}

function mapRow(row) {
  const name = pick(row, 'name');
  const latitude = Number(pick(row, 'latitude', 'lat'));
  const longitude = Number(pick(row, 'longitude', 'lng', 'lon'));

  if (!name || Number.isNaN(latitude) || Number.isNaN(longitude)) {
    throw new Error(`Invalid row (need name, latitude, longitude): ${JSON.stringify(row)}`);
  }

  const res = {
    name,
    latitude,
    longitude,
    address: pick(row, 'address'),
    city: pick(row, 'city'),
    charger_class: pick(row, 'charger_class', 'chargerClass'),
    connector_type: pick(row, 'connector_type', 'connectorType'),
    power_kw: pick(row, 'power_kw', 'powerKw'),
    price_per_kwh: pick(row, 'price_per_kwh', 'pricePerKwh'),
    operating_hours: pick(row, 'operating_hours', 'operatingHours'),
    phone_number: pick(row, 'phone_number', 'phoneNumber', 'phone'),
    connectivity_tier: pick(row, 'connectivity_tier', 'connectivityTier') ?? 'listed',
    verification_status: pick(row, 'verification_status', 'verificationStatus') ?? 'unverified',
    google_place_id: pick(row, 'google_place_id', 'googlePlaceId', 'place_id'),
    google_maps_url: pick(row, 'google_maps_url', 'googleMapsUrl'),
    google_rating: pick(row, 'google_rating', 'googleRating', 'rating'),
    google_rating_count: pick(row, 'google_rating_count', 'googleRatingCount', 'user_ratings_total'),
    google_photo_urls: pick(row, 'google_photo_urls', 'googlePhotoUrls') ?? [],
    google_raw: pick(row, 'google_raw', 'googleRaw'),
    source: pick(row, 'source') ?? 'manual',
    scraped_at: pick(row, 'scraped_at', 'scrapedAt') ?? new Date().toISOString(),
    is_public: pick(row, 'is_public', 'isPublic') ?? true,
  };
  return res;
}

const rows = raw.map(mapRow);
const supabase = createClient(url, key, { auth: { persistSession: false } });

let upserted = 0;
let inserted = 0;

for (const row of rows) {
  if (row.google_place_id) {
    const { error } = await supabase
      .from('terminals')
      .upsert(row, { onConflict: 'google_place_id' });
    if (error) {
      console.error('Upsert failed:', row.name, error.message);
      process.exit(1);
    }
    upserted += 1;
  } else {
    const { error } = await supabase.from('terminals').insert(row);
    if (error) {
      console.error('Insert failed:', row.name, error.message);
      process.exit(1);
    }
    inserted += 1;
  }
}

console.log(`Done. upserted=${upserted} inserted=${inserted} total=${rows.length}`);
