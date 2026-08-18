import type { Tables, TerminalStatus } from '@/types/database.types';
import {
  mockTerminals,
  OWNER_ID_MALL,
  VENDOR_ID,
} from '@/lib/mock/terminals';
import type { MockTerminal } from '@/lib/mock/types';

type TerminalRow = Tables<'terminals'>;

export function mockTerminalToRow(t: MockTerminal): TerminalRow {
  return {
    id: t.id,
    name: t.name,
    latitude: t.latitude,
    longitude: t.longitude,
    city: t.city,
    address: t.address,
    connector_type: t.connectorType,
    charger_class: t.chargerClass,
    power_kw: t.powerKw,
    price_per_kwh: t.pricePerKwh,
    operating_hours: t.operatingHours,
    phone_number: null,
    amenities: t.amenities,
    connectivity_tier: t.connectivityTier,
    verification_status: t.verificationStatus,
    current_vendor_id: t.vendorId,
    current_owner_id: t.ownerId,
    google_place_id: null,
    google_maps_url: null,
    google_rating: 4.5,
    google_rating_count: 120,
    google_photo_urls: t.photoUrl ? [t.photoUrl] : [],
    google_raw: null,
    source: 'vendor_submitted',
    scraped_at: null,
    last_verified_at: `${t.installedAt}T00:00:00Z`,
    is_public: true,
    submitted_by_user_id: null,
    submission_notes: null,
    external_ids: null,
    source_raw: null,
    created_at: `${t.installedAt}T00:00:00Z`,
    updated_at: `${t.installedAt}T00:00:00Z`,
  };
}

export function screenshotPublicTerminals(city?: string | null): TerminalRow[] {
  const rows = mockTerminals.map(mockTerminalToRow);
  if (!city) return rows;
  return rows.filter((t) => t.city === city);
}

export function screenshotOwnerTerminals(_ownerId?: string): TerminalRow[] {
  return mockTerminals
    .filter((t) => t.ownerId === OWNER_ID_MALL)
    .map(mockTerminalToRow);
}

export function screenshotVendorTerminals(_vendorId?: string): TerminalRow[] {
  return mockTerminals.filter((t) => t.vendorId === VENDOR_ID).map(mockTerminalToRow);
}

export function screenshotAllTerminals(): TerminalRow[] {
  return mockTerminals.map(mockTerminalToRow);
}

export function screenshotTerminalById(id: string): TerminalRow | null {
  const match = mockTerminals.find((t) => t.id === id);
  return match ? mockTerminalToRow(match) : null;
}

export function screenshotStatusSnapshots(
  terminalIds: string[],
): Map<string, { terminal_id: string; status: TerminalStatus; recorded_at: string }> {
  const map = new Map<
    string,
    { terminal_id: string; status: TerminalStatus; recorded_at: string }
  >();
  for (const terminal of mockTerminals) {
    if (!terminalIds.includes(terminal.id) || !terminal.status) continue;
    map.set(terminal.id, {
      terminal_id: terminal.id,
      status: terminal.status,
      recorded_at: new Date().toISOString(),
    });
  }
  return map;
}
