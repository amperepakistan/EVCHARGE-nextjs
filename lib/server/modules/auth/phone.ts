/**
 * Pakistani mobile number handling for driver OTP auth.
 *
 * Canonical form stored everywhere is E.164: `+92` followed by the 10-digit
 * national number, which always starts with `3` for mobiles (`+923001234567`).
 */

const PK_MOBILE_NATIONAL = /^3\d{9}$/;

/**
 * Accepts the shapes a driver actually types — `03001234567`, `3001234567`,
 * `+92 300 1234567`, `0092-300-1234567` — and returns E.164, or null when the
 * number is not a valid Pakistani mobile.
 */
export function normalizePkMobile(raw: string): string | null {
  const digitsOnly = raw.replace(/[^\d+]/g, '');
  if (!digitsOnly) return null;

  let national = digitsOnly;
  if (national.startsWith('+92')) {
    national = national.slice(3);
  } else if (national.startsWith('0092')) {
    national = national.slice(4);
  } else if (national.startsWith('92') && national.length === 12) {
    national = national.slice(2);
  } else if (national.startsWith('0')) {
    national = national.slice(1);
  }

  // A stray '+' anywhere else means the input was never a plain PK number.
  if (national.includes('+')) return null;
  if (!PK_MOBILE_NATIONAL.test(national)) return null;

  return `+92${national}`;
}

/** `+923001234567` → `+92 300 1234567`, for user-facing copy and logs. */
export function formatPkMobile(e164: string): string {
  const national = e164.startsWith('+92') ? e164.slice(3) : e164;
  if (!PK_MOBILE_NATIONAL.test(national)) return e164;
  return `+92 ${national.slice(0, 3)} ${national.slice(3)}`;
}
