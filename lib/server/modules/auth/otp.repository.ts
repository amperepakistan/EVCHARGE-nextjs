import bcrypt from 'bcryptjs';
import type { AuthUserRecord } from '@/lib/server/modules/auth/auth.repository';
import { supabaseServer } from '@/lib/supabase/server';

export type OtpChallenge = {
  phoneNumber: string;
  codeHash: string;
  expiresAt: string;
  attempts: number;
  lastSentAt: string;
};

/** Upsert the live challenge for a phone number (a resend replaces the old code). */
export async function saveChallenge(input: {
  phoneNumber: string;
  code: string;
  expiresAt: Date;
}): Promise<void> {
  const code_hash = await bcrypt.hash(input.code, 10);
  const { error } = await supabaseServer()
    .from('phone_otp_challenges')
    .upsert(
      {
        phone_number: input.phoneNumber,
        code_hash,
        expires_at: input.expiresAt.toISOString(),
        attempts: 0,
        last_sent_at: new Date().toISOString(),
      },
      { onConflict: 'phone_number' },
    );

  if (error) throw new Error(error.message);
}

export async function findChallenge(phoneNumber: string): Promise<OtpChallenge | null> {
  const { data, error } = await supabaseServer()
    .from('phone_otp_challenges')
    .select('phone_number, code_hash, expires_at, attempts, last_sent_at')
    .eq('phone_number', phoneNumber)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    phoneNumber: data.phone_number,
    codeHash: data.code_hash,
    expiresAt: data.expires_at,
    attempts: data.attempts,
    lastSentAt: data.last_sent_at,
  };
}

export async function incrementAttempts(phoneNumber: string, current: number): Promise<void> {
  const { error } = await supabaseServer()
    .from('phone_otp_challenges')
    .update({ attempts: current + 1 })
    .eq('phone_number', phoneNumber);
  if (error) throw new Error(error.message);
}

export async function deleteChallenge(phoneNumber: string): Promise<void> {
  const { error } = await supabaseServer()
    .from('phone_otp_challenges')
    .delete()
    .eq('phone_number', phoneNumber);
  if (error) throw new Error(error.message);
}

export async function verifyChallengeCode(codeHash: string, code: string): Promise<boolean> {
  return bcrypt.compare(code, codeHash);
}

export async function findUserByPhone(phoneNumber: string): Promise<AuthUserRecord | null> {
  const { data, error } = await supabaseServer()
    .from('users')
    .select('id, email, phone_number, role, full_name, is_active')
    .eq('phone_number', phoneNumber)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data || !data.is_active) return null;

  return {
    id: data.id,
    email: data.email,
    phoneNumber: data.phone_number,
    role: data.role,
    fullName: data.full_name ?? '',
  };
}

/**
 * Create a driver account keyed on a phone number. No email, no password —
 * the OTP is the only credential.
 */
export async function createDriverUserByPhone(input: {
  phoneNumber: string;
  fullName?: string;
}): Promise<AuthUserRecord> {
  const { data: user, error: userError } = await supabaseServer()
    .from('users')
    .insert({
      phone_number: input.phoneNumber,
      role: 'driver',
      full_name: input.fullName ?? null,
      is_active: true,
    })
    .select('id, email, phone_number, role, full_name')
    .single();

  if (userError || !user) {
    throw new Error(userError?.message ?? 'Failed to create user');
  }

  const { error: driverError } = await supabaseServer().from('drivers').insert({
    user_id: user.id,
    phone_number: input.phoneNumber,
  });

  if (driverError) {
    // Best-effort cleanup if driver insert fails.
    await supabaseServer().from('users').delete().eq('id', user.id);
    throw new Error(driverError.message);
  }

  return {
    id: user.id,
    email: user.email,
    phoneNumber: user.phone_number,
    role: user.role,
    fullName: user.full_name ?? '',
  };
}
