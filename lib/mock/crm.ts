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
    businessName: 'Dolmen Group',
    contactName: 'Sana Iqbal',
    contactEmail: 'sana.iqbal@dolmen.pk',
    contactPhone: '+92 21 111 456 789',
    installFee: 1850000,
    monthlyFee: 42000,
    contractStatus: 'active',
    contractStartedAt: '2026-01-15',
    terminalCount: 4,
    notes: 'Flagship account — expansion planned to Dolmen Clifton in Q4.',
  },
  {
    id: 'cust-askari',
    ownerId: OWNER_ID_SOCIETY,
    businessName: 'Askari Housing Society',
    contactName: 'Imran Shah',
    contactEmail: 'imran.shah@askarihs.pk',
    contactPhone: '+92 42 111 222 333',
    installFee: 980000,
    monthlyFee: 18000,
    contractStatus: 'active',
    contractStartedAt: '2026-02-01',
    terminalCount: 6,
    notes: 'Society board reviews the maintenance SLA every quarter.',
  },
  {
    id: 'cust-serena',
    ownerId: 'own-serena',
    businessName: 'Serena Hotels',
    contactName: 'Fatima Chaudhry',
    contactEmail: 'fatima.c@serenahotels.pk',
    contactPhone: '+92 51 220 0000',
    installFee: 640000,
    monthlyFee: 12500,
    contractStatus: 'pending',
    contractStartedAt: '2026-08-01',
    terminalCount: 2,
    notes: 'Contract signed, install crew scheduled for next week.',
  },
  {
    id: 'cust-pearl',
    ownerId: 'own-pearlcontinental',
    businessName: 'Pearl Continental Hotels',
    contactName: 'Zeeshan Baig',
    contactEmail: 'zeeshan.baig@pchotels.pk',
    contactPhone: '+92 91 111 000 111',
    installFee: 510000,
    monthlyFee: 9000,
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
