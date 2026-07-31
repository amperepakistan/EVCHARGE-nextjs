/**
 * One-shot super-admin seeder.
 * Usage: node --env-file=.env.local scripts/create-admin.mjs admin@evcharge.pk 'YourPassword123'
 */
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const [email, password] = process.argv.slice(2);

if (!email || !password) {
  console.error('Usage: node --env-file=.env.local scripts/create-admin.mjs <email> <password>');
  process.exit(1);
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const password_hash = await bcrypt.hash(password, 12);
const supabase = createClient(url, key, { auth: { persistSession: false } });

const { data, error } = await supabase
  .from('users')
  .upsert(
    {
      email: email.toLowerCase(),
      password_hash,
      role: 'super_admin',
      full_name: 'Super Admin',
      is_active: true,
    },
    { onConflict: 'email' },
  )
  .select('id, email, role')
  .single();

if (error) {
  console.error(error.message);
  process.exit(1);
}

console.log('Created/updated super admin:', data);
