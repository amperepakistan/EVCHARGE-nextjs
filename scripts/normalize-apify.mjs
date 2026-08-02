/**
 * Normalize raw Apify datasets (Maps + EV/OSM actors) with strict Pakistan coordinate validation.
 *
 * Usage:
 *   node --env-file=.env.local scripts/normalize-apify.mjs
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const rawDir = resolve('scripts/output/raw');
const outputDir = resolve('scripts/output');
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

if (!existsSync(rawDir)) {
  console.error(`Raw directory not found: ${rawDir}. Please run 'npm run scrape:apify' first.`);
  process.exit(1);
}

// Bounding box for Pakistan: Lat ~23.5 to 37.1, Lng ~60.8 to 77.8
function isInsidePakistan(lat, lng) {
  return lat >= 23.5 && lat <= 37.1 && lng >= 60.8 && lng <= 77.8;
}

function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function parseConnectorAndClass(chargingDetails) {
  let connectorType = 'CCS1';
  let chargerClass = 'DC';
  let powerKw = 50;

  if (!chargingDetails) return { connectorType, chargerClass, powerKw };

  const str = JSON.stringify(chargingDetails).toUpperCase();
  if (str.includes('NACS') || str.includes('TESLA')) connectorType = 'NACS';
  else if (str.includes('CCS2')) connectorType = 'CCS2';
  else if (str.includes('CCS')) connectorType = 'CCS1';
  else if (str.includes('CHADEMO')) connectorType = 'CHAdeMO';
  else if (str.includes('TYPE2') || str.includes('TYPE 2')) connectorType = 'Type 2';
  else if (str.includes('J1772')) connectorType = 'J1772';

  if (str.includes('AC') || str.includes('LEVEL 2') || str.includes('L2')) chargerClass = 'AC';

  const kwMatch = str.match(/(\d+(\.\d+)?)\s*KW/i);
  if (kwMatch && kwMatch[1]) {
    powerKw = parseFloat(kwMatch[1]);
  }

  return { connectorType, chargerClass, powerKw };
}

const rawFiles = readdirSync(rawDir);
const mapsFiles = rawFiles.filter((f) => f.endsWith('-maps.json'));
const evFiles = rawFiles.filter((f) => f.endsWith('-ev.json'));

const terminalsMap = new Map();
let rejectedNonPkCount = 0;

console.log('Normalizing scraped Apify datasets with strict PK coordinate verification...');

// 1. Process Google Maps Items
for (const file of mapsFiles) {
  const cityName = file.replace('-maps.json', '');
  const items = JSON.parse(readFileSync(resolve(rawDir, file), 'utf8'));

  for (const item of items) {
    const placeId = item.placeId || item.id;
    const lat = item.location?.lat || item.latitude;
    const lng = item.location?.lng || item.longitude;

    if (!item.title || !lat || !lng) continue;

    // Strict PK coordinate validation check
    if (!isInsidePakistan(lat, lng)) {
      rejectedNonPkCount++;
      continue;
    }

    const { connectorType, chargerClass, powerKw } = parseConnectorAndClass(
      item.chargingStations || item.additionalInfo
    );

    const key = placeId || `${lat.toFixed(4)}_${lng.toFixed(4)}`;

    terminalsMap.set(key, {
      name: item.title,
      latitude: lat,
      longitude: lng,
      address: item.address || item.street,
      city: cityName.charAt(0).toUpperCase() + cityName.slice(1),
      charger_class: chargerClass,
      connector_type: connectorType,
      power_kw: powerKw,
      price_per_kwh: null,
      operating_hours: item.openingHours ? JSON.stringify(item.openingHours) : '24/7',
      phone_number: item.phone,
      connectivity_tier: 'listed',
      verification_status: 'unverified',
      google_place_id: placeId,
      google_maps_url: item.url || item.googleMapsUrl,
      google_rating: item.totalScore || item.rating,
      google_rating_count: item.reviewsCount || item.userRatingsTotal,
      google_photo_urls: item.imageUrl ? [item.imageUrl] : item.images || [],
      google_raw: item,
      external_ids: { google_place_id: placeId, apify_maps_id: item.id },
      source_raw: { maps: item },
      source: 'scraped',
      scraped_at: new Date().toISOString(),
      is_public: true,
    });
  }
}

// 2. Process & Merge EV Hardware / OSM Items
for (const file of evFiles) {
  const items = JSON.parse(readFileSync(resolve(rawDir, file), 'utf8'));

  for (const evItem of items) {
    const evLat = evItem.latitude || evItem.lat;
    const evLng = evItem.longitude || evItem.lng;

    if (!evLat || !evLng) continue;

    if (!isInsidePakistan(evLat, evLng)) {
      rejectedNonPkCount++;
      continue;
    }

    let matchedKey = null;

    for (const [key, existing] of terminalsMap.entries()) {
      const dist = calculateDistanceMeters(existing.latitude, existing.longitude, evLat, evLng);
      if (dist <= 100) {
        matchedKey = key;
        break;
      }
    }

    const { connectorType, chargerClass, powerKw } = parseConnectorAndClass(evItem);

    if (matchedKey) {
      const target = terminalsMap.get(matchedKey);
      target.connector_type = connectorType || target.connector_type;
      target.power_kw = powerKw || target.power_kw;
      target.external_ids = { ...target.external_ids, osm_id: evItem.id || evItem.osm_id };
      target.source_raw = { ...target.source_raw, ev_actor: evItem };
    } else {
      const key = evItem.id ? `osm_${evItem.id}` : `${evLat.toFixed(4)}_${evLng.toFixed(4)}`;
      terminalsMap.set(key, {
        name: evItem.name || evItem.title || 'EV Charging Point',
        latitude: evLat,
        longitude: evLng,
        address: evItem.address,
        city: evItem.city || 'Pakistan',
        charger_class: chargerClass,
        connector_type: connectorType,
        power_kw: powerKw,
        price_per_kwh: null,
        operating_hours: '24/7',
        phone_number: null,
        connectivity_tier: 'listed',
        verification_status: 'unverified',
        google_place_id: null,
        google_maps_url: null,
        google_rating: null,
        google_rating_count: null,
        google_photo_urls: [],
        external_ids: { osm_id: evItem.id },
        source_raw: { ev_actor: evItem },
        source: 'scraped',
        scraped_at: new Date().toISOString(),
        is_public: true,
      });
    }
  }
}

const result = Array.from(terminalsMap.values());
const outputFile = resolve(outputDir, 'terminals-scraped-pk.json');
writeFileSync(outputFile, JSON.stringify(result, null, 2));

console.log(
  `Normalization complete. Wrote ${result.length} valid PK terminal records to ${outputFile} (Rejected ${rejectedNonPkCount} non-PK items)`
);
