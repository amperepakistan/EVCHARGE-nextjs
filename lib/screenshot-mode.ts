/** TEMP screenshot overlay (Oman). Flip to `false` to restore live Pakistan / DB data. */
export const SCREENSHOT_AU = true;

export const MONEY = SCREENSHOT_AU ? 'OMR' : 'Rs';

export function formatMoney(amount: number, decimals?: number): string {
  if (SCREENSHOT_AU) {
    const digits = decimals ?? (Math.abs(amount) < 10 ? 3 : 0);
    return `OMR ${amount.toLocaleString('en-US', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })}`;
  }
  return `Rs ${Math.round(amount).toLocaleString()}`;
}
