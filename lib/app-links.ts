/**
 * Where the "get the app" surfaces point.
 *
 * Both store URLs are correct. Android is live on Google Play; iOS still
 * 404s until its App Store listing is approved (currently "Prepare for
 * Submission"). The QR in the header modal deliberately points at the site
 * rather than a store, so it keeps working through review and can be
 * re-pointed later without reprinting anything that embeds it.
 *
 * The QR image itself is generated, not hand-drawn:
 *   npx qrcode -t svg -o public/brand/get-app-qr.svg "https://www.amperepakistan.com"
 * Regenerate it if SITE_URL changes.
 */
export const SITE_URL = 'https://www.amperepakistan.com';

export const APP_STORE_URL = 'https://apps.apple.com/app/id6799933790';
export const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=pk.ampere.app';

export const GET_APP_QR = '/brand/get-app-qr.svg';
