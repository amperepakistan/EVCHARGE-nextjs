/**
 * Single source of truth for the legal pages.
 *
 * Both `/privacy` and `/terms` read every name, address, email and date from
 * here so that buying the domain or incorporating is a one-file edit rather
 * than a search-and-replace across two long documents.
 *
 * TODO before publishing to the app stores:
 *   1. Confirm `DOMAIN` once PKNIC registration completes.
 *   2. Point the mailboxes at real inboxes — Apple and Google both check that
 *      the privacy contact resolves.
 *   3. Fill `OPERATOR.registeredAddress`.
 *
 * Deliberately NOT recorded here: the proprietor's CNIC/NTN. For an individual
 * that number is the CNIC, and these pages are public.
 */

export const DOMAIN = 'ampere.pk';

export const OPERATOR = {
  /** Trading name shown to users. */
  name: 'Ampere',
  /**
   * The legal person that controls user data. A sole proprietorship is not a
   * separate legal entity, so this stays the proprietor until incorporation.
   */
  legalName: 'Ampere (sole proprietorship)',
  jurisdiction: 'Pakistan',
  /** Courts named in the governing-law clause. */
  forum: 'Karachi, Sindh',
  registeredAddress: 'Karachi, Sindh, Pakistan',
} as const;

export const CONTACT = {
  privacy: `privacy@${DOMAIN}`,
  legal: `legal@${DOMAIN}`,
  support: `support@${DOMAIN}`,
  partners: `partners@${DOMAIN}`,
} as const;

/** Bump whenever either document changes materially. */
export const EFFECTIVE_DATE = '10 August 2026';

export const APP_NAME = 'Ampere: EV Charging';
