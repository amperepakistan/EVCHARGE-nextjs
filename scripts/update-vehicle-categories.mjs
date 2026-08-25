/**
 * Update target_vehicle_category on all terminals in Supabase database
 *
 * Infers 'car', 'bike', or 'both' based on connector_type, power_kw, name, and description.
 *
 * Usage:
 *   node --env-file=.env scripts/update-vehicle-categories.mjs
 */

import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

function inferVehicleCategory(t) {
  const name = (t.name || '').toLowerCase();
  const conn = (t.connector_type || '').toLowerCase();
  const notes = (t.submission_notes || '').toLowerCase();

  // Special check for Crown Warehouse (856120) or Crown Group ChargePro location
  if (name.includes('crown warehouse') || name.includes('chargepro') || (name.includes('crown') && (conn.includes('wall') || conn.includes('bs1363')))) {
    return 'both'; // Crown Warehouse features 10kW AC e-bike (10x 2kW ports) + 7kW car charger!
  }

  const hasCarConnector = conn.includes('ccs') || conn.includes('type 2') || conn.includes('chademo') || conn.includes('gb/t') || conn.includes('nacs') || (t.power_kw && t.power_kw >= 7);
  const hasBikeConnector = conn.includes('wall') || conn.includes('bs1363') || conn.includes('euro') || conn.includes('schuko') || name.includes('bike') || name.includes('ebike') || (t.power_kw && t.power_kw <= 3);

  if (hasCarConnector && hasBikeConnector) {
    return 'both';
  } else if (hasBikeConnector && !hasCarConnector) {
    return 'bike';
  } else {
    return 'car';
  }
}

(async () => {
  console.log('Fetching all terminals from Supabase...');
  const { data: terminals, error } = await supabase.from('terminals').select('*');

  if (error) {
    console.error('Failed to fetch terminals:', error.message);
    process.exit(1);
  }

  console.log(`Analyzing ${terminals.length} terminals...`);
  let updatedCount = 0;

  for (const t of terminals) {
    const category = inferVehicleCategory(t);
    console.log(`Terminal "${t.name}" -> Category: [${category}] (Connectors: ${t.connector_type})`);

    const { error: updateError } = await supabase
      .from('terminals')
      .update({ target_vehicle_category: category })
      .eq('id', t.id);

    if (updateError) {
      console.error(`Failed to update ${t.name}:`, updateError.message);
    } else {
      updatedCount++;
    }
  }

  console.log(`====================================================`);
  console.log(` Successfully updated ${updatedCount} terminals with target_vehicle_category!`);
  console.log(`====================================================`);
})();
