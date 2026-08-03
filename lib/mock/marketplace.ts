import { VENDOR_ID, VENDOR_ID_ALT } from '@/lib/mock/terminals';
import type { MockVendorPackage, MockVendorProfile } from '@/lib/mock/types';

/**
 * Owner-facing directory: vendors registered with Ampere and the fixed
 * installation packages they sell. Lets an owner shop for a new install
 * instead of having to already know a vendor.
 */
export const mockVendorProfiles: MockVendorProfile[] = [
  {
    id: VENDOR_ID,
    name: 'VoltGrid Services',
    tagline: 'Full-service install and maintenance across Sindh & Punjab',
    yearsActive: 4,
    sitesInstalled: 38,
    rating: 4.7,
    coverageCities: ['Karachi', 'Hyderabad', 'Multan', 'Lahore', 'Rawalpindi', 'Peshawar'],
    responseTime: 'Same-day site survey',
  },
  {
    id: VENDOR_ID_ALT,
    name: 'ChargeWorks',
    tagline: 'Premium AC/DC installs for hospitality and corporate campuses',
    yearsActive: 2,
    sitesInstalled: 14,
    rating: 4.5,
    coverageCities: ['Islamabad', 'Lahore'],
    responseTime: '48-hour site survey',
  },
  {
    id: 'vnd-northgrid',
    name: 'NorthGrid EV',
    tagline: 'Motorway and highway corridor specialists',
    yearsActive: 3,
    sitesInstalled: 22,
    rating: 4.6,
    coverageCities: ['Islamabad', 'Peshawar', 'Sadiqabad'],
    responseTime: '72-hour site survey',
  },
];

export const mockVendorPackages: MockVendorPackage[] = [
  {
    id: 'pkg-vg-starter',
    vendorId: VENDOR_ID,
    name: 'Starter — 2 station',
    stationCount: 2,
    totalKw: 120,
    connectorType: 'CCS2',
    includesIntegration: true,
    priceInPkr: 6000000,
    turnaroundDays: 21,
    description: '2 DC fast chargers, 120 kW combined, full Ampere app integration.',
  },
  {
    id: 'pkg-vg-growth',
    vendorId: VENDOR_ID,
    name: 'Growth — 4 station',
    stationCount: 4,
    totalKw: 240,
    connectorType: 'CCS2',
    includesIntegration: true,
    priceInPkr: 11200000,
    turnaroundDays: 30,
    description: '4 DC fast chargers across two bays, load-balanced, Ampere integration.',
  },
  {
    id: 'pkg-vg-ac',
    vendorId: VENDOR_ID,
    name: 'AC Destination — 3 station',
    stationCount: 3,
    totalKw: 66,
    connectorType: 'Type 2',
    includesIntegration: true,
    priceInPkr: 2450000,
    turnaroundDays: 14,
    description: 'Lower-cost AC destination charging for malls, hotels and offices.',
  },
  {
    id: 'pkg-cw-premium',
    vendorId: VENDOR_ID_ALT,
    name: 'Premium Hospitality — 2 station',
    stationCount: 2,
    totalKw: 100,
    connectorType: 'CCS2',
    includesIntegration: true,
    priceInPkr: 6800000,
    turnaroundDays: 25,
    description: 'White-glove install with branded canopy, Ampere integration included.',
  },
  {
    id: 'pkg-ng-corridor',
    vendorId: 'vnd-northgrid',
    name: 'Corridor — 1 station',
    stationCount: 1,
    totalKw: 60,
    connectorType: 'CCS2',
    includesIntegration: true,
    priceInPkr: 3400000,
    turnaroundDays: 35,
    description: 'Single high-power unit built for motorway service areas.',
  },
];

export function packagesForVendor(vendorId: string): MockVendorPackage[] {
  return mockVendorPackages.filter((p) => p.vendorId === vendorId);
}
