/**
 * Seed demo users for every dashboard role (local / staging only).
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-demo-users.mjs
 *
 * Credentials (printed again at the end):
 *   admin@evcharge.pk  / Admin123!   → /admin
 *   staff@evcharge.pk  / Staff123!   → /admin
 *   vendor@evcharge.pk / Vendor123!  → /vendor
 *   owner@evcharge.pk  / Owner123!   → /owner
 *   driver@evcharge.pk / Driver123!  → API / Flutter (no dashboard)
 */
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const DEMO_USERS = [
  {
    email: 'admin@evcharge.pk',
    password: 'Admin123!',
    role: 'super_admin',
    full_name: 'Demo Super Admin',
  },
  {
    email: 'staff@evcharge.pk',
    password: 'Staff123!',
    role: 'staff',
    full_name: 'Demo Staff',
  },
  {
    email: 'vendor@evcharge.pk',
    password: 'Vendor123!',
    role: 'vendor',
    full_name: 'Demo Vendor Admin',
  },
  {
    email: 'owner@evcharge.pk',
    password: 'Owner123!',
    role: 'owner',
    full_name: 'Demo Owner Admin',
  },
  {
    email: 'driver@evcharge.pk',
    password: 'Driver123!',
    role: 'driver',
    full_name: 'Demo Driver',
  },
];

async function upsertUser({ email, password, role, full_name }) {
  const normalized = email.toLowerCase();
  const password_hash = await bcrypt.hash(password, 12);
  const { error } = await supabase.from('users').upsert(
    {
      email: normalized,
      password_hash,
      role,
      full_name,
      is_active: true,
    },
    { onConflict: 'email' },
  );

  if (error) throw new Error(`users upsert (${email}): ${error.message}`);

  // Re-fetch by email so we always use the persisted row id (upsert RETURNING
  // can be unreliable when the conflict path updates an existing user).
  const { data, error: fetchError } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('email', normalized)
    .single();

  if (fetchError || !data) {
    throw new Error(`users fetch (${email}): ${fetchError?.message ?? 'not found'}`);
  }
  return data;
}

async function ensureVendor(userId) {
  const contact_email = 'vendor@evcharge.pk';

  const { data: existing } = await supabase
    .from('vendors')
    .select('id')
    .eq('contact_email', contact_email)
    .maybeSingle();

  let vendorId = existing?.id;
  if (!vendorId) {
    const { data, error } = await supabase
      .from('vendors')
      .insert({
        name: 'EVCharge Demo Vendor',
        contact_email,
        contact_phone: '+92-300-0000001',
        tier: 'standard',
      })
      .select('id')
      .single();
    if (error) throw new Error(`vendors insert: ${error.message}`);
    vendorId = data.id;
  }

  const { data: existingMember } = await supabase
    .from('vendor_members')
    .select('id')
    .eq('vendor_id', vendorId)
    .eq('user_id', userId)
    .maybeSingle();

  if (!existingMember) {
    const { error: memberError } = await supabase.from('vendor_members').insert({
      vendor_id: vendorId,
      user_id: userId,
      member_role: 'admin',
    });
    if (memberError) throw new Error(`vendor_members: ${memberError.message}`);
  }

  return vendorId;
}

async function ensureOwner(userId) {
  const contact_email = 'owner@evcharge.pk';

  const { data: existing } = await supabase
    .from('terminal_owners')
    .select('id')
    .eq('contact_email', contact_email)
    .maybeSingle();

  let ownerId = existing?.id;
  if (!ownerId) {
    const { data, error } = await supabase
      .from('terminal_owners')
      .insert({
        name: 'EVCharge Demo Owner',
        owner_type: 'business',
        contact_email,
        contact_phone: '+92-300-0000002',
      })
      .select('id')
      .single();
    if (error) throw new Error(`terminal_owners insert: ${error.message}`);
    ownerId = data.id;
  }

  const { data: existingMember } = await supabase
    .from('owner_members')
    .select('id')
    .eq('owner_id', ownerId)
    .eq('user_id', userId)
    .maybeSingle();

  if (!existingMember) {
    const { error: memberError } = await supabase.from('owner_members').insert({
      owner_id: ownerId,
      user_id: userId,
      member_role: 'admin',
    });
    if (memberError) throw new Error(`owner_members: ${memberError.message}`);
  }

  return ownerId;
}

async function ensureDriver(userId) {
  const { data: existing } = await supabase
    .from('drivers')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) return existing.id;

  const { data, error } = await supabase
    .from('drivers')
    .insert({
      user_id: userId,
      email: 'driver@evcharge.pk',
      phone_number: '+923000000003',
    })
    .select('id')
    .single();

  if (error) throw new Error(`drivers insert: ${error.message}`);
  return data.id;
}

async function assignSampleTerminals(vendorId, ownerId) {
  const { data: terminals, error } = await supabase
    .from('terminals')
    .select('id, name, city')
    .eq('is_public', true)
    .order('city')
    .limit(12);

  if (error) throw new Error(`terminals select: ${error.message}`);
  if (!terminals?.length) {
    console.log('No public terminals to assign (seed terminals first).');
    return;
  }

  const ids = terminals.map((t) => t.id);
  const vendorSlice = ids.slice(0, Math.min(6, ids.length));
  const ownerSlice = ids.slice(0, Math.min(6, ids.length));

  if (vendorSlice.length) {
    const { error: vErr } = await supabase
      .from('terminals')
      .update({ current_vendor_id: vendorId })
      .in('id', vendorSlice);
    if (vErr) throw new Error(`assign vendor: ${vErr.message}`);
  }

  if (ownerSlice.length) {
    const { error: oErr } = await supabase
      .from('terminals')
      .update({ current_owner_id: ownerId })
      .in('id', ownerSlice);
    if (oErr) throw new Error(`assign owner: ${oErr.message}`);
  }

  console.log(
    `Assigned ${vendorSlice.length} terminals to demo vendor, ${ownerSlice.length} to demo owner.`,
  );
}

console.log('Seeding demo users…');

const byRole = {};
for (const demo of DEMO_USERS) {
  const user = await upsertUser(demo);
  byRole[user.role] = user;
  console.log(`  ${user.role.padEnd(12)} ${user.email}`);
}

const vendorId = await ensureVendor(byRole.vendor.id);
const ownerId = await ensureOwner(byRole.owner.id);
await ensureDriver(byRole.driver.id);
await assignSampleTerminals(vendorId, ownerId);

console.log('\nDemo credentials (local/staging only):');
console.log('─────────────────────────────────────────────');
for (const demo of DEMO_USERS) {
  const home =
    demo.role === 'vendor'
      ? '/vendor'
      : demo.role === 'owner'
        ? '/owner'
        : demo.role === 'driver'
          ? '(API / Flutter)'
          : '/admin';
  console.log(`${demo.email.padEnd(22)} ${demo.password.padEnd(12)} → ${home}`);
}
console.log('─────────────────────────────────────────────');
