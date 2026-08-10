import bcrypt from 'bcryptjs';
import type { UserRole } from '@/types/database.types';
import { supabaseServer } from '@/lib/supabase/server';

export type AuthUserRecord = {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
};

/**
 * Lookup active user by email and verify password hash.
 */
export async function findUserByCredentials(
  email: string,
  password: string,
): Promise<AuthUserRecord | null> {
  const normalized = email.trim().toLowerCase();
  const { data, error } = await supabaseServer()
    .from('users')
    .select('id, email, password_hash, role, full_name, is_active')
    .eq('email', normalized)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data || !data.is_active) {
    return null;
  }

  const ok = await bcrypt.compare(password, data.password_hash);
  if (!ok) {
    return null;
  }

  return {
    id: data.id,
    email: data.email,
    role: data.role,
    fullName: data.full_name ?? data.email,
  };
}

export async function findUserById(userId: string): Promise<AuthUserRecord | null> {
  const { data, error } = await supabaseServer()
    .from('users')
    .select('id, email, role, full_name, is_active')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data || !data.is_active) return null;

  return {
    id: data.id,
    email: data.email,
    role: data.role,
    fullName: data.full_name ?? data.email,
  };
}

export async function createDriverUser(input: {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
}): Promise<AuthUserRecord> {
  const normalized = input.email.trim().toLowerCase();
  const password_hash = await bcrypt.hash(input.password, 12);

  const { data: existing } = await supabaseServer()
    .from('users')
    .select('id')
    .eq('email', normalized)
    .maybeSingle();

  if (existing) {
    throw new Error('EMAIL_TAKEN');
  }

  const { data: user, error: userError } = await supabaseServer()
    .from('users')
    .insert({
      email: normalized,
      password_hash,
      role: 'driver',
      full_name: input.fullName,
      is_active: true,
    })
    .select('id, email, role, full_name')
    .single();

  if (userError || !user) {
    throw new Error(userError?.message ?? 'Failed to create user');
  }

  const { error: driverError } = await supabaseServer().from('drivers').insert({
    user_id: user.id,
    email: normalized,
    phone_number: input.phoneNumber ?? null,
  });

  if (driverError) {
    // Best-effort cleanup if driver insert fails
    await supabaseServer().from('users').delete().eq('id', user.id);
    throw new Error(driverError.message);
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    fullName: user.full_name ?? user.email,
  };
}

export async function updateUserPassword(userId: string, password: string): Promise<void> {
  const password_hash = await bcrypt.hash(password, 12);
  const { error } = await supabaseServer()
    .from('users')
    .update({ password_hash })
    .eq('id', userId);
  if (error) throw new Error(error.message);
}

export async function isEmailTaken(email: string, excludeUserId?: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  let query = supabaseServer().from('users').select('id').eq('email', normalized);
  if (excludeUserId) {
    query = query.neq('id', excludeUserId);
  }
  const { data, error } = await query.maybeSingle();
  if (error) throw new Error(error.message);
  return Boolean(data);
}
