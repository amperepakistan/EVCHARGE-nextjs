/**
 * Pull Google Maps photos (and rating when present) for curated manual
 * stations using Apify Google Maps actor + their maps.app.goo.gl links.
 *
 * Usage:
 *   node --env-file=.env.local scripts/enrich-photos-from-maps.mjs
 */
import { ApifyClient } from 'apify-client';
import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const token = process.env.APIFY_TOKEN;
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const mapsActorId = process.env.APIFY_MAPS_ACTOR || 'compass/crawler-google-places';

if (!token || !url || !key) {
  console.error('Need APIFY_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const client = new ApifyClient({ token });

const { data: stations, error } = await supabase
  .from('terminals')
  .select(
    'id, name, latitude, longitude, google_maps_url, google_place_id, google_photo_urls, google_rating, google_raw, operating_hours',
  )
  .like('google_place_id', 'manual:ftid:%');

if (error) {
  console.error(error.message);
  process.exit(1);
}

if (!stations?.length) {
  console.error('No manual:ftid stations found');
  process.exit(1);
}

const links = stations
  .map((s) => s.google_maps_url)
  .filter(Boolean);

console.log(`Enriching photos for ${stations.length} stations via ${mapsActorId}…`);
console.log(links.map((l) => `  ${l}`).join('\n'));

// Actor input: start from the exact short Google Maps place URLs Umer shared
const mapsInput = {
  startUrls: links.map((u) => ({ url: u })),
  maxCrawledPlacesPerSearch: 1,
  language: 'en',
  includeOpeningHours: true,
  countryCode: 'pk',
  locationQuery: 'Karachi, Pakistan',
};

const run = await client.actor(mapsActorId).call(mapsInput, {
  waitSecs: 300,
});
console.log(`Run finished. dataset=${run.defaultDatasetId} status=${run.status}`);

const { items } = await client.dataset(run.defaultDatasetId).listItems();
const outDir = resolve('scripts/output/raw');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
writeFileSync(
  resolve(outDir, 'karachi-manual-photos.json'),
  JSON.stringify(items, null, 2),
);
console.log(`Got ${items.length} place items from Apify`);

function photosFromItem(item) {
  const urls = [];
  if (item.imageUrl) urls.push(item.imageUrl);
  if (Array.isArray(item.images)) {
    for (const im of item.images) {
      if (typeof im === 'string') urls.push(im);
      else if (im?.url) urls.push(im.url);
    }
  }
  if (Array.isArray(item.imageUrls)) urls.push(...item.imageUrls.filter(Boolean));
  // de-dupe
  return [...new Set(urls)].slice(0, 8);
}

function matchStation(item) {
  const title = (item.title || item.name || '').toLowerCase();
  const lat = item.location?.lat ?? item.latitude;
  const lng = item.location?.lng ?? item.longitude;
  const placeId = item.placeId || item.place_id;

  let best = null;
  let bestScore = -1;
  for (const s of stations) {
    let score = 0;
    const sn = (s.name || '').toLowerCase();
    // token overlap
    for (const tok of sn.split(/[\s—\-–,/()]+/).filter((t) => t.length > 3)) {
      if (title.includes(tok.toLowerCase())) score += 2;
    }
    if (lat && lng) {
      const dlat = Math.abs(Number(lat) - Number(s.latitude));
      const dlng = Math.abs(Number(lng) - Number(s.longitude));
      if (dlat < 0.02 && dlng < 0.02) score += 5;
      if (dlat < 0.05 && dlng < 0.05) score += 2;
    }
    // direct url match via search page sometimes embeds short codes
    if (s.google_maps_url && item.url?.includes(s.google_maps_url.split('/').pop()?.slice(0, 8))) {
      score += 3;
    }
    if (score > bestScore) {
      bestScore = score;
      best = s;
    }
  }
  return bestScore >= 3 ? best : null;
}

// Also match remaining stations in order if actor returned 1:1 with startUrls
async function updateStation(station, item) {
  const photos = photosFromItem(item);
  const rating = item.totalScore ?? item.rating ?? null;
  const ratingCount = item.reviewsCount ?? item.userRatingsTotal ?? null;
  const hours = item.openingHours;
  let operatingHours = station.operating_hours;
  // keep existing unless we can improve
  if (Array.isArray(hours) && hours.length) {
    const all24 = hours.every((h) =>
      /open\s*24|24\s*hours/i.test(String(h.hours || '')),
    );
    operatingHours = all24
      ? '24/7'
      : hours
          .map((h) => `${h.day}: ${h.hours}`)
          .join(' · ')
          .slice(0, 240);
  }

  const phone = item.phone || item.phoneUnformatted || null;
  const realPlaceId = item.placeId || null;

  const patch = {
    google_photo_urls: photos.length ? photos : station.google_photo_urls || [],
    google_rating: rating ?? undefined,
    google_rating_count: ratingCount ?? undefined,
    phone_number: phone || undefined,
    scraped_at: new Date().toISOString(),
    google_raw: {
      ...(typeof station.google_raw === 'object' && station.google_raw
        ? station.google_raw
        : {}),
      apify_enrich: item,
      photo_source: 'apify_maps',
    },
  };

  // Don't overwrite our synthetic manual:ftid place_id keys (used for upsert)
  // — store ChIJ id in raw + maps url if better
  if (item.url) patch.google_maps_url = station.google_maps_url || item.url;

  // remove undefined keys
  for (const k of Object.keys(patch)) {
    if (patch[k] === undefined) delete patch[k];
  }

  const { error: upErr } = await supabase
    .from('terminals')
    .update(patch)
    .eq('id', station.id);

  if (upErr) {
    console.error(`Update failed ${station.name}:`, upErr.message);
    return false;
  }
  console.log(
    `✓ ${station.name} → ${photos.length} photo(s)` +
      (rating != null ? `, rating ${rating}` : '') +
      (realPlaceId ? `, placeId ${realPlaceId}` : ''),
  );
  return true;
}

const used = new Set();
let updated = 0;

for (const item of items) {
  const station = matchStation(item);
  if (!station || used.has(station.id)) {
    // fall through sequential assign later
    continue;
  }
  used.add(station.id);
  if (await updateStation(station, item)) updated++;
}

// Sequential fallback if count matches
if (updated < stations.length && items.length === stations.length) {
  console.log('Applying sequential 1:1 fallback for remaining…');
  for (let i = 0; i < stations.length; i++) {
    if (used.has(stations[i].id)) continue;
    used.add(stations[i].id);
    if (await updateStation(stations[i], items[i])) updated++;
  }
}

// Last resort: name-only update from items that startUrl-ordered poorly
if (updated < stations.length) {
  const remaining = stations.filter((s) => !used.has(s.id));
  const leftover = items.filter((it, idx) => {
    // items already used implicitly
    return true;
  });
  console.log(
    `Still need photos for ${remaining.length}:`,
    remaining.map((s) => s.name).join(', '),
  );
}

console.log(`\nDone. updated=${updated}/${stations.length}`);
console.log(`Raw payload: scripts/output/raw/karachi-manual-photos.json`);
