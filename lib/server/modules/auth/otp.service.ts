import { signToken } from '@/lib/auth/jwt';
import { AppError } from '@/lib/server/errors';
import type { PublicAuthUser } from '@/lib/server/modules/auth/auth.service';
import * as otpRepo from '@/lib/server/modules/auth/otp.repository';
import {
  requestOtpSchema,
  verifyOtpSchema,
  type RequestOtpInput,
  type VerifyOtpInput,
} from '@/lib/server/modules/auth/otp.schema';
import { generateCode, isDevOtpMode, sendCode } from '@/lib/server/modules/auth/otp.sender';

/** How long a code stays valid. */
const CODE_TTL_MS = 5 * 60 * 1000;
/** Minimum gap between sends to the same number. */
const RESEND_COOLDOWN_MS = 30 * 1000;
/** Wrong guesses allowed before the code is burned. */
const MAX_ATTEMPTS = 5;

export type RequestOtpResult = {
  phoneNumber: string;
  expiresAt: string;
  /** Present only in dev mode, so the app can prefill the fixed code. */
  devCode?: string;
};

export type VerifyOtpResult = {
  user: PublicAuthUser;
  token: string;
  /** True when this verification created the account. */
  isNewUser: boolean;
};

export async function requestOtp(raw: unknown): Promise<RequestOtpResult> {
  const parsed = requestOtpSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? 'Invalid phone number');
  }
  return requestOtpWithInput(parsed.data);
}

export async function requestOtpWithInput(input: RequestOtpInput): Promise<RequestOtpResult> {
  const { phoneNumber } = input;

  let existing;
  try {
    existing = await otpRepo.findChallenge(phoneNumber);
  } catch (err) {
    throw new AppError(500, err instanceof Error ? err.message : 'Unable to send code');
  }

  if (existing) {
    const sinceLastSend = Date.now() - new Date(existing.lastSentAt).getTime();
    if (sinceLastSend < RESEND_COOLDOWN_MS) {
      const wait = Math.ceil((RESEND_COOLDOWN_MS - sinceLastSend) / 1000);
      throw new AppError(429, `Please wait ${wait}s before requesting another code`);
    }
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + CODE_TTL_MS);

  try {
    await otpRepo.saveChallenge({ phoneNumber, code, expiresAt });
    await sendCode(phoneNumber, code);
  } catch (err) {
    throw new AppError(500, err instanceof Error ? err.message : 'Unable to send code');
  }

  return {
    phoneNumber,
    expiresAt: expiresAt.toISOString(),
    ...(isDevOtpMode() ? { devCode: code } : {}),
  };
}

export async function verifyOtp(raw: unknown): Promise<VerifyOtpResult> {
  const parsed = verifyOtpSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? 'Invalid verification body');
  }
  return verifyOtpWithInput(parsed.data);
}

export async function verifyOtpWithInput(input: VerifyOtpInput): Promise<VerifyOtpResult> {
  const { phoneNumber, code, fullName } = input;

  let challenge;
  try {
    challenge = await otpRepo.findChallenge(phoneNumber);
  } catch (err) {
    throw new AppError(500, err instanceof Error ? err.message : 'Unable to verify code');
  }

  if (!challenge) {
    throw new AppError(400, 'Request a new code to continue');
  }

  if (new Date(challenge.expiresAt).getTime() <= Date.now()) {
    await otpRepo.deleteChallenge(phoneNumber).catch(() => {});
    throw new AppError(400, 'That code expired. Request a new one.');
  }

  if (challenge.attempts >= MAX_ATTEMPTS) {
    await otpRepo.deleteChallenge(phoneNumber).catch(() => {});
    throw new AppError(429, 'Too many incorrect attempts. Request a new code.');
  }

  const ok = await otpRepo.verifyChallengeCode(challenge.codeHash, code);
  if (!ok) {
    await otpRepo.incrementAttempts(phoneNumber, challenge.attempts).catch(() => {});
    throw new AppError(401, 'That code is incorrect');
  }

  // The code is single-use, whatever happens next.
  await otpRepo.deleteChallenge(phoneNumber).catch(() => {});

  let user;
  let isNewUser = false;
  try {
    user = await otpRepo.findUserByPhone(phoneNumber);
    if (!user) {
      user = await otpRepo.createDriverUserByPhone({ phoneNumber, fullName });
      isNewUser = true;
    }
  } catch (err) {
    throw new AppError(500, err instanceof Error ? err.message : 'Unable to sign in');
  }

  const token = await signToken({ userId: user.id, role: user.role });

  return {
    user: {
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      fullName: user.fullName,
    },
    token,
    isNewUser,
  };
}
