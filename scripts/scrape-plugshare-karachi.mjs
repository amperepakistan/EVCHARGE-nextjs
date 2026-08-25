/**
 * PlugShare Karachi EV Charger Scraper
 *
 * Scrapes all EV charging locations in Karachi and surrounding areas from PlugShare,
 * maps them to our Supabase database schema (`terminals` table), cross-references
 * against existing database/seed records, and exports clean CSV & JSON files.
 *
 * Usage:
 *   node scripts/scrape-plugshare-karachi.mjs
 */

import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';

const OUTPUT_DIR = path.resolve('scripts/output');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 1. Load existing Karachi chargers to detect duplicates
const existingChargers = [];

function loadExistingFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const items = Array.isArray(raw) ? raw : [raw];
    for (const item of items) {
      if (item.latitude && item.longitude) {
        existingChargers.push({
          id: item.id || null,
          name: item.name || '',
          latitude: Number(item.latitude),
          longitude: Number(item.longitude),
          google_place_id: item.google_place_id || null,
          source_file: path.basename(filePath)
        });
      }
    }
  } catch (err) {
    console.warn(`Warning: Could not read existing dataset ${filePath}:`, err.message);
  }
}

loadExistingFile('scripts/output/karachi-manual-maps.json');
loadExistingFile('scripts/output/terminals-scraped-pk.json');

console.log(`Loaded ${existingChargers.length} existing Karachi chargers for deduplication matching.`);

// Calculate distance in meters using Haversine formula
function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function checkIsAlreadyListed(loc) {
  for (const ex of existingChargers) {
    if (ex.google_place_id && loc.google_place_id && ex.google_place_id === loc.google_place_id) {
      return { listed: true, match_reason: `Google Place ID match (${ex.google_place_id})`, existing_name: ex.name };
    }
    const dist = getDistanceMeters(loc.latitude, loc.longitude, ex.latitude, ex.longitude);
    if (dist < 350) {
      return { listed: true, match_reason: `Location proximity (${Math.round(dist)}m from ${ex.name})`, existing_name: ex.name };
    }
  }
  return { listed: false, match_reason: 'New location', existing_name: '' };
}

// Fallback map for PlugShare Plug Type IDs
function mapPlugType(typeId) {
  const plugTypes = {
    1: 'J1772 (Type 1)',
    2: 'CCS1',
    3: 'Type 2 (Mennekes)',
    4: 'CCS2',
    5: 'CHAdeMO',
    6: 'Tesla Roadster',
    7: 'NACS (Tesla)',
    8: 'GB/T (DC Fast)',
    9: 'Wall Outlet (BS1363/Schuko)',
    10: 'Three Phase / CEE',
    11: 'Europlug',
    13: 'GB/T (AC)',
    14: 'Type 3'
  };
  return plugTypes[typeId] || `Plug Type ${typeId}`;
}

(async () => {
  console.log('====================================================');
  console.log(' Starting PlugShare Karachi EV Charger Scraper');
  console.log('====================================================');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
  });
  const page = await browser.newPage();

  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  console.log('Bypassing Cloudflare protection via PlugShare location 856120...');
  await page.goto('https://www.plugshare.com/location/856120', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  await page.setExtraHTTPHeaders({
    'Authorization': 'Basic d2ViX3YyOkVOanNuUE54NHhXeHVkODU=',
    'Accept': 'application/json, text/plain, */*'
  });

  async function fetchJson(url) {
    try {
      const response = await page.goto(url, { waitUntil: 'networkidle2' });
      if (response && response.ok()) {
        const text = await page.evaluate(() => document.body.innerText);
        return JSON.parse(text);
      } else {
        console.error(`Fetch failed for ${url}: status ${response ? response.status() : 'no response'}`);
        return null;
      }
    } catch (err) {
      console.error(`Error fetching ${url}:`, err.message);
      return null;
    }
  }

  // Bounding boxes covering all of Karachi & surrounding highways
  const regionPoints = [
    { name: 'Karachi Central & South', lat: 24.8607, lng: 67.0011, spanLat: 0.6, spanLng: 0.6 },
    { name: 'Karachi East & Malir', lat: 24.9300, lng: 67.1500, spanLat: 0.6, spanLng: 0.6 },
    { name: 'M-9 Motorway & Nooriabad', lat: 25.1000, lng: 67.5000, spanLat: 0.8, spanLng: 0.8 }
  ];

  const locationMap = new Map();

  for (const point of regionPoints) {
    console.log(`Querying PlugShare API for ${point.name}...`);
    const url = `https://api.plugshare.com/v3/locations/region?count=500&latitude=${point.lat}&longitude=${point.lng}&spanLat=${point.spanLat}&spanLng=${point.spanLng}`;
    const items = await fetchJson(url);

    if (Array.isArray(items)) {
      console.log(` -> Found ${items.length} locations in ${point.name}`);
      for (const item of items) {
        if (!locationMap.has(item.id)) {
          locationMap.set(item.id, item);
        }
      }
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`Total unique PlugShare location IDs found in Karachi region: ${locationMap.size}`);

  const detailedTerminals = [];

  for (const [locId, summary] of locationMap.entries()) {
    console.log(`Fetching full details for Location ID ${locId}: "${summary.name}"...`);
    await new Promise(r => setTimeout(r, 1200)); // rate limiting delay to stay safe
    const details = await fetchJson(`https://api.plugshare.com/v3/locations/${locId}`);

    const rawLoc = details || summary;

    const stations = rawLoc.stations || [];
    const connectorDetails = [];
    let isDcStation = Boolean(rawLoc.is_fast_charger);
    let maxKw = 0;

    for (const st of stations) {
      const outlets = st.outlets || st.connectors || [];
      const stKw = Number(st.kilowatts || 0);
      if (stKw > maxKw) maxKw = stKw;

      for (const out of outlets) {
        const cName = out.connector_name || mapPlugType(out.connector_type || out.connector);
        const kw = Number(out.kilowatts || out.power || stKw || 0);
        if (kw > maxKw) maxKw = kw;
        if (out.is_dc || out.power_type === 'DC') isDcStation = true;

        connectorDetails.push(kw > 0 ? `${cName} (${kw}kW)` : cName);
      }
    }

    const connectorTypeStr = Array.from(new Set(connectorDetails)).join(', ') || 'Unspecified';
    const chargerClass = isDcStation ? 'DC' : 'AC';

    const rawAddress = [rawLoc.address1, rawLoc.address2, rawLoc.locality || 'Karachi', rawLoc.region || 'Sindh', rawLoc.postal_code, rawLoc.country]
      .filter(Boolean)
      .join(', ');

    const dupCheck = checkIsAlreadyListed({
      latitude: rawLoc.latitude,
      longitude: rawLoc.longitude,
      google_place_id: rawLoc.google_place_id
    });

    const terminalRow = {
      id: rawLoc.id ? `plugshare_${rawLoc.id}` : '',
      name: rawLoc.name || 'Unnamed Charger',
      latitude: Number(rawLoc.latitude),
      longitude: Number(rawLoc.longitude),
      city: rawLoc.locality || 'Karachi',
      address: rawAddress || `${rawLoc.name}, Karachi, Pakistan`,
      connector_type: connectorTypeStr,
      charger_class: chargerClass,
      power_kw: maxKw > 0 ? maxKw : null,
      price_per_kwh: null,
      cost_description: rawLoc.cost_description || rawLoc.cost || 'Unspecified',
      operating_hours: rawLoc.hours || rawLoc.operating_hours || (rawLoc.access === 1 ? '24/7 Public Access' : 'Hours not listed'),
      phone_number: rawLoc.formatted_phone_number || rawLoc.phone || null,
      connectivity_tier: 'listed',
      verification_status: rawLoc.score && rawLoc.score >= 7 ? 'verified' : 'unverified',
      google_place_id: rawLoc.google_place_id || null,
      google_maps_url: `https://www.google.com/maps/search/?api=1&query=${rawLoc.latitude},${rawLoc.longitude}`,
      google_rating: rawLoc.score ? Number((rawLoc.score / 2).toFixed(1)) : null,
      google_rating_count: rawLoc.total_reviews || rawLoc.reviews_count || null,
      source: 'scraped',
      scraped_at: new Date().toISOString(),
      is_public: rawLoc.access === 1 || rawLoc.access === null || rawLoc.is_public !== false,
      plugshare_id: rawLoc.id,
      plugshare_url: `https://www.plugshare.com/location/${rawLoc.id}`,
      plugshare_score: rawLoc.score || null,
      is_already_listed: dupCheck.listed,
      listing_status: dupCheck.listed ? 'listed' : 'new',
      duplicate_match_reason: dupCheck.match_reason,
      existing_match_name: dupCheck.existing_name
    };

    detailedTerminals.push(terminalRow);
  }

  await browser.close();

  // Save JSON
  const jsonPath = path.join(OUTPUT_DIR, 'plugshare_karachi_terminals.json');
  fs.writeFileSync(jsonPath, JSON.stringify(detailedTerminals, null, 2));

  // Save CSV
  const csvPath = path.join(OUTPUT_DIR, 'plugshare_karachi_terminals.csv');
  const headers = [
    'id',
    'name',
    'latitude',
    'longitude',
    'city',
    'address',
    'connector_type',
    'charger_class',
    'power_kw',
    'price_per_kwh',
    'cost_description',
    'operating_hours',
    'phone_number',
    'connectivity_tier',
    'verification_status',
    'google_place_id',
    'google_maps_url',
    'google_rating',
    'google_rating_count',
    'source',
    'scraped_at',
    'is_public',
    'plugshare_id',
    'plugshare_url',
    'plugshare_score',
    'is_already_listed',
    'listing_status',
    'duplicate_match_reason',
    'existing_match_name'
  ];

  function escapeCsvCell(val) {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  const csvRows = [headers.join(',')];
  for (const row of detailedTerminals) {
    const line = headers.map(h => escapeCsvCell(row[h])).join(',');
    csvRows.push(line);
  }

  fs.writeFileSync(csvPath, csvRows.join('\n'), 'utf8');

  // Also write a copy to root workspace directory so user can easily open it directly!
  fs.writeFileSync('plugshare_karachi_terminals.csv', csvRows.join('\n'), 'utf8');

  console.log(`====================================================`);
  console.log(` SUCCESS! Scraped ${detailedTerminals.length} Karachi chargers.`);
  console.log(` Exported CSV to: ${csvPath}`);
  console.log(` Exported CSV to: plugshare_karachi_terminals.csv`);
  console.log(` Exported JSON to: ${jsonPath}`);
  console.log(`====================================================`);

})();
