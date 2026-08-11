/**
 * Seed 1-2 demo terminal_cameras rows per public terminal, so the CCTV
 * foundation (driver app screen + owner dashboard) has something to render
 * locally without waiting on real camera hardware.
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-cameras.mjs [limit]
 *
 * Idempotent: skips terminals that already have camera rows.
 */
import { createClient } from '@supabase/supabase-js';

const limit = Number(process.argv[2] ?? 20);

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const { data: terminals, error: terminalsError } = await supabase
  .from('terminals')
  .select('id, name')
  .eq('is_public', true)
  .limit(limit);

if (terminalsError) {
  console.error('Failed to list terminals:', terminalsError.message);
  process.exit(1);
}

let seeded = 0;
let skipped = 0;

for (const terminal of terminals ?? []) {
  const { count, error: countError } = await supabase
    .from('terminal_cameras')
    .select('id', { count: 'exact', head: true })
    .eq('terminal_id', terminal.id);

  if (countError) {
    console.error('Failed to check existing cameras:', terminal.name, countError.message);
    continue;
  }
  if (count && count > 0) {
    skipped += 1;
    continue;
  }

  const rows = [
    {
      terminal_id: terminal.id,
      label: 'Entrance',
      stream_type: 'snapshot',
      snapshot_url: `https://picsum.photos/seed/${terminal.id}-entrance/640/360`,
      online: true,
      last_seen_at: new Date().toISOString(),
    },
    {
      terminal_id: terminal.id,
      label: 'Charging bay',
      stream_type: 'snapshot',
      snapshot_url: `https://picsum.photos/seed/${terminal.id}-bay/640/360`,
      online: Math.random() > 0.3,
      last_seen_at: new Date().toISOString(),
    },
  ];

  const { error } = await supabase.from('terminal_cameras').insert(rows);
  if (error) {
    console.error('Insert failed:', terminal.name, error.message);
    continue;
  }
  seeded += 1;
}

console.log(`Done. seeded=${seeded} skipped=${skipped} total=${terminals?.length ?? 0}`);
