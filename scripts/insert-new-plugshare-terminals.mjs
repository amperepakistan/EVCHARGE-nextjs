/**
 * Insert New PlugShare Chargers into Supabase Database & Update Dataset
 *
 * Reads `scripts/output/plugshare_karachi_terminals.json`,
 * filters for new unlisted chargers (where `is_already_listed` is false),
 * inserts them into Supabase `terminals` table using environment credentials,
 * and updates the local seed dataset.
 *
 * Usage:
 *   node --env-file=.env scripts/insert-new-plugshare-terminals.mjs
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const scrapedPath = path.resolve('scripts/output/plugshare_karachi_terminals.json');
if (!fs.existsSync(scrapedPath)) {
  console.error(`Error: Could not find scraped terminals file at ${scrapedPath}`);
  process.exit(1);
}

const allScraped = JSON.parse(fs.readFileSync(scrapedPath, 'utf8'));
const newChargers = allScraped.filter(c => c.is_already_listed === false || c.listing_status === 'new');

console.log(`====================================================`);
console.log(` Found ${newChargers.length} NEW chargers to insert into database (out of ${allScraped.length} total scraped).`);
console.log(`====================================================`);

if (newChargers.length === 0) {
  console.log('No new chargers to insert!');
  process.exit(0);
}

const dbRows = newChargers.map(item => {
  return {
    name: item.name,
    latitude: Number(item.latitude),
    longitude: Number(item.longitude),
    city: item.city || 'Karachi',
    address: item.address,
    connector_type: item.connector_type || null,
    charger_class: item.charger_class || 'AC',
    power_kw: item.power_kw ? Number(item.power_kw) : null,
    price_per_kwh: item.price_per_kwh ? Number(item.price_per_kwh) : null,
    operating_hours: item.operating_hours || 'Hours not listed',
    phone_number: item.phone_number || null,
    connectivity_tier: 'listed',
    verification_status: item.verification_status || 'unverified',
    google_maps_url: item.google_maps_url || null,
    google_rating: item.google_rating ? Number(item.google_rating) : null,
    google_rating_count: item.google_rating_count ? Number(item.google_rating_count) : null,
    source: 'scraped',
    scraped_at: item.scraped_at || new Date().toISOString(),
    is_public: true
  };
});

let insertedCount = 0;
let errorCount = 0;

for (const row of dbRows) {
  console.log(`Inserting: "${row.name}" (${row.latitude}, ${row.longitude})...`);
  const { data, error } = await supabase
    .from('terminals')
    .insert(row)
    .select('id, name');

  if (error) {
    console.error(` -> Failed to insert "${row.name}":`, error.message);
    errorCount++;
  } else {
    console.log(` -> Successfully inserted DB ID: ${data[0].id}`);
    insertedCount++;
  }
}

console.log(`====================================================`);
console.log(` DATABASE INSERTION COMPLETE!`);
console.log(` Successfully inserted: ${insertedCount} new terminals into Supabase.`);
if (errorCount > 0) console.log(` Errors: ${errorCount}`);
console.log(`====================================================`);
