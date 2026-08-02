/**
 * Scrape EV station data from Apify Actors with strict Pakistan geolocation & country filtering.
 *
 * Usage:
 *   node --env-file=.env.local scripts/scrape-apify.mjs
 */
import { ApifyClient } from 'apify-client';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const token = process.env.APIFY_TOKEN;
if (!token || token === 'your-apify-token') {
  console.error('ERROR: APIFY_TOKEN is missing or set to default in .env.local');
  process.exit(1);
}

const client = new ApifyClient({ token });
const configPath = resolve('scripts/scrape-config.json');
const config = JSON.parse(readFileSync(configPath, 'utf8'));

const mapsActorId = process.env.APIFY_MAPS_ACTOR || 'nwua9Gu5YrADL7ZDj';
const evActorId = process.env.APIFY_EV_ACTOR || 'dataquarry/ev-charging-stations';

const outputDir = resolve('scripts/output/raw');
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

console.log(`Starting Strict PK Apify Scraping for ${config.cities.length} cities...`);

for (const city of config.cities) {
  console.log(`\n--- Scraping ${city.name}, Pakistan ---`);
  const cityName = city.name.toLowerCase();

  // 1. Run Google Maps Actor with Geolocation & Country Code
  console.log(`Running Maps Actor (${mapsActorId}) for ${city.name}, PK...`);
  try {
    const mapsInput = {
      searchStringsArray: city.searchStrings,
      locationQuery: `${city.name}, Pakistan`,
      countryCode: 'pk',
      city: city.name,
      customGeolocation: {
        type: 'Point',
        coordinates: [city.lng, city.lat],
      },
      maxCrawledPlacesPerSearch: config.maxItemsPerCity || 50,
      language: 'en',
      includeOpeningHours: true,
    };

    const mapsRun = await client.actor(mapsActorId).call(mapsInput);
    console.log(`Maps Run completed. Dataset ID: ${mapsRun.defaultDatasetId}`);

    const { items: mapsItems } = await client.dataset(mapsRun.defaultDatasetId).listItems();
    const mapsFile = resolve(outputDir, `${cityName}-maps.json`);
    writeFileSync(mapsFile, JSON.stringify(mapsItems, null, 2));
    console.log(`Saved ${mapsItems.length} Maps items to ${mapsFile}`);
  } catch (err) {
    console.error(`Failed Maps scrape for ${city.name}:`, err.message);
  }

  // 2. Run EV Hardware / OSM Actor with Center Point Geolocation
  console.log(`Running EV Hardware Actor (${evActorId}) for ${city.name}, PK...`);
  try {
    const evInput = {
      aroundLocation: `${city.lat},${city.lng}`,
      radiusMeters: city.radiusMeters || 35000,
      maxItems: config.maxItemsPerCity || 50,
    };

    const evRun = await client.actor(evActorId).call(evInput);
    console.log(`EV Hardware Run completed. Dataset ID: ${evRun.defaultDatasetId}`);

    const { items: evItems } = await client.dataset(evRun.defaultDatasetId).listItems();
    const evFile = resolve(outputDir, `${cityName}-ev.json`);
    writeFileSync(evFile, JSON.stringify(evItems, null, 2));
    console.log(`Saved ${evItems.length} EV items to ${evFile}`);
  } catch (err) {
    console.error(`Failed EV Hardware scrape for ${city.name}:`, err.message);
  }
}

console.log('\nScraping complete. Raw output stored in scripts/output/raw/');
