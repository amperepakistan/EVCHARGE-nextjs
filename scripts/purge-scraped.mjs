/**
 * Purge scraped non-PK rows from Supabase database.
 * Usage: node --env-file=.env.local scripts/purge-scraped.mjs
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function purge() {
  console.log('Purging scraped terminals from database...');
  const { data, error } = await supabase
    .from('terminals')
    .delete()
    .eq('source', 'scraped')
    .select('id');

  if (error) {
    console.error('Purge failed:', error.message);
    process.exit(1);
  }

  console.log(`Successfully purged ${data?.length || 0} scraped rows.`);
}

purge();
