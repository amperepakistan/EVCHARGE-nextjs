import { OWNER_ID_MALL, OWNER_ID_SOCIETY, VENDOR_ID, VENDOR_ID_ALT } from '@/lib/mock/terminals';
import type { MockCustomer } from '@/lib/mock/types';

/**
 * The vendor's own book of business — the terminal owners they've sold and
 * installed for. This is a B2B relationship (vendor -> owner), separate from
 * the driver-facing `charging_sessions` revenue, which is not the vendor's
 * concern per the client: "what the terminals are generating on a daily
 * basis isn't the vendor's concern... they might want to see it but it isn't
 * an essential stat."
 *
 * No schema table exists for this yet — named to map cleanly onto a real
 * CRM/contracts table later.
 */
export const mockCustomers: MockCustomer[] = [
  {
    id: 'cust-dolmen',
    ownerId: OWNER_ID_MALL,
    businessName: 'Omran Group',
    contactName: 'Nasser Al Busaidi',
    contactEmail: 'nasser.albusaidi@omran.om',
    contactPhone: '+968 2452 3000',
    installFee: 7200,
    monthlyFee: 180,
    contractStatus: 'active',
    contractStartedAt: '2026-01-15',
    terminalCount: 4,
    notes: 'Flagship account — expansion planned to Oman Avenues Mall in Q4.',
  },
  {
    id: 'cust-askari',
    ownerId: OWNER_ID_SOCIETY,
    businessName: 'Al Mouj Muscat',
    contactName: 'Fatma Al Harthy',
    contactEmail: 'fatma.alharthy@almouj.com',
    contactPhone: '+968 2453 8888',
    installFee: 3400,
    monthlyFee: 75,
    contractStatus: 'active',
    contractStartedAt: '2026-02-01',
    terminalCount: 6,
    notes: 'Community board reviews the maintenance SLA every quarter.',
  },
  {
    id: 'cust-serena',
    ownerId: 'own-serena',
    businessName: 'Al Bustan Palace',
    contactName: 'Layla Al Zadjali',
    contactEmail: 'layla.alzadjali@albustan.om',
    contactPhone: '+968 2479 9666',
    installFee: 5400,
    monthlyFee: 135,
    contractStatus: 'pending',
    contractStartedAt: '2026-08-01',
    terminalCount: 2,
    notes: 'Contract signed, install crew scheduled for next week.',
  },
  {
    id: 'cust-pearl',
    ownerId: 'own-pearlcontinental',
    businessName: 'Crowne Plaza Muscat',
    contactName: 'Hassan Al Balushi',
    contactEmail: 'hassan.albalushi@ihg.com',
    contactPhone: '+968 2466 0660',
    installFee: 2800,
    monthlyFee: 64,
    contractStatus: 'lapsed',
    contractStartedAt: '2025-06-10',
    terminalCount: 1,
    notes: 'Maintenance contract lapsed after renewal quote was declined.',
  },
];

export function customersForVendor(vendorId: string): MockCustomer[] {
  // Both demo vendors share the same customer book in this dummy dataset —
  // in the real schema this would join through vendor_members / contracts.
  return vendorId === VENDOR_ID || vendorId === VENDOR_ID_ALT ? mockCustomers : [];
}

export function customerById(id: string): MockCustomer | undefined {
  return mockCustomers.find((c) => c.id === id);
}
