import { formatPkMobile } from '@/lib/server/modules/auth/phone';

/**
 * Where OTP codes come from and where they go.
 *
 * Today: a fixed development code that is never actually delivered, so the
 * driver app can be exercised end to end without a messaging provider.
 * Next: a WhatsApp Business template send — swap `generateCode` for a random
 * code and `sendCode` for the provider call. Nothing above this file changes.
 */

/** Fixed code accepted while OTP delivery is not wired up yet. */
export const DEV_OTP_CODE = '1234';

/** True while codes are fixed rather than random and delivered. */
export function isDevOtpMode(): boolean {
  // Flip by wiring a provider and returning false; kept as a function so the
  // WhatsApp integration can gate on an env var without touching callers.
  return true;
}

export function generateCode(): string {
  if (isDevOtpMode()) return DEV_OTP_CODE;
  return String(Math.floor(Math.random() * 10_000)).padStart(4, '0');
}

export async function sendCode(phoneNumber: string, code: string): Promise<void> {
  if (isDevOtpMode()) {
    console.info(`[otp] dev mode — code for ${formatPkMobile(phoneNumber)} is ${code}`);
    return;
  }

  // TODO(whatsapp): send `code` via the WhatsApp Business API template.
  throw new Error('No OTP delivery provider configured');
}
