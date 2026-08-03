/**
 * Types for the dummy-data MVP.
 *
 * Where a Supabase table already exists (`terminals`, `vendors`,
 * `terminal_owners`, `users`) we reuse the generated row types from
 * `types/database.types.ts`. Domains that have no table yet (health, faults,
 * maintenance, sessions, revenue) are declared here and deliberately named
 * after the tables they will become, so the eventual migration is a rename of
 * the import, not a rewrite of the UI.
 */
import type { ChargerClass, ConnectivityTier } from '@/types/database.types';

/** Mirrors `terminal_status_snapshots.status`. */
export type TerminalStatus = 'available' | 'occupied' | 'offline' | 'fault';

/** A station as the dashboards need it — flattened for display. */
export interface MockTerminal {
  id: string;
  name: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  chargerClass: ChargerClass;
  connectorType: string;
  powerKw: number;
  pricePerKwh: number;
  operatingHours: string;
  connectivityTier: ConnectivityTier;
  verificationStatus: 'unverified' | 'verified' | 'flagged';
  vendorId: string;
  ownerId: string;
  /** Null when the terminal has no live telemetry (listed tier). */
  status: TerminalStatus | null;
  installedAt: string;
  amenities: string[];
  photoUrl: string | null;
}

/** Mirrors the §3 real-time health block. */
export interface MockHealth {
  terminalId: string;
  healthScore: number;
  internalTempC: number;
  connectorTempC: number;
  voltageV: number;
  currentA: number;
  powerKw: number;
  coolingFanOk: boolean;
  doorClosed: boolean;
  contactorOk: boolean;
  isolationOk: boolean;
  communicationOk: boolean;
  lastHeartbeat: string;
  /** Predictive-maintenance advice, empty when nothing is degrading. */
  recommendations: string[];
}

export type FaultSeverity = 'critical' | 'major' | 'minor';
export type FaultStatus = 'active' | 'acknowledged' | 'resolved';

export interface MockFault {
  id: string;
  terminalId: string;
  code: string;
  label: string;
  severity: FaultSeverity;
  status: FaultStatus;
  detectedAt: string;
  assignedTo: string | null;
  ticketId: string | null;
}

export type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed';

export interface MockMaintenanceJob {
  id: string;
  terminalId: string;
  title: string;
  status: MaintenanceStatus;
  scheduledFor: string;
  technician: string;
  partsUsed: string[];
}

export interface MockPart {
  sku: string;
  name: string;
  inStock: number;
  reorderAt: number;
}

/** Mirrors `charging_sessions`. */
export interface MockSession {
  id: string;
  terminalId: string;
  driverLabel: string;
  startedAt: string;
  endedAt: string | null;
  kwhDelivered: number;
  amountCharged: number;
  /** Reservations that were never honoured — §10 no-show detection. */
  noShow?: boolean;
}

export interface MockRevenuePoint {
  date: string;
  revenue: number;
  energyKwh: number;
}

export type VendorTeamRole =
  | 'Operator'
  | 'Station Manager'
  | 'Technician'
  | 'Finance'
  | 'Support Agent';

export interface MockTeamMember {
  id: string;
  name: string;
  email: string;
  role: VendorTeamRole;
  active: boolean;
  lastActive: string;
}

export type PricingModel = 'flat' | 'time' | 'hybrid' | 'dynamic';

export interface MockTariff {
  id: string;
  name: string;
  model: PricingModel;
  summary: string;
  appliedToTerminalIds: string[];
}

export interface MockAnprCapture {
  id: string;
  plate: string;
  capturedAt: string;
  listStatus: 'whitelist' | 'blacklist' | 'unknown';
  terminalId: string;
}

/**
 * The vendor's own book of business — the terminal owners they've sold and
 * installed for. This is separate from driver-facing charging revenue,
 * which per the client is not the vendor's concern day to day.
 */
export type ContractStatus = 'active' | 'pending' | 'lapsed';

export interface MockCustomer {
  id: string;
  ownerId: string;
  businessName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  installFee: number;
  monthlyFee: number;
  contractStatus: ContractStatus;
  contractStartedAt: string;
  terminalCount: number;
  notes: string;
}

/**
 * Vendors as they appear in the owner-facing marketplace — a directory of
 * installers registered with the platform, each selling fixed installation
 * packages. No schema table exists for this yet.
 */
export interface MockVendorProfile {
  id: string;
  name: string;
  tagline: string;
  yearsActive: number;
  sitesInstalled: number;
  rating: number;
  coverageCities: string[];
  responseTime: string;
}

export interface MockVendorPackage {
  id: string;
  vendorId: string;
  name: string;
  stationCount: number;
  totalKw: number;
  connectorType: string;
  includesIntegration: boolean;
  priceInPkr: number;
  turnaroundDays: number;
  description: string;
}

export interface MockCamera {
  id: string;
  label: string;
  online: boolean;
  terminalId: string;
}

export interface MockParkingBay {
  id: string;
  label: string;
  occupiedBy: 'ev' | 'ice' | null;
  overstayMinutes: number;
}
