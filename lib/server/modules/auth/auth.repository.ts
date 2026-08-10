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
