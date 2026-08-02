// EV Charging Station Model Definitions based on Refined Database Schema

export type PlugType = 'CCS1' | 'CCS2' | 'NACS' | 'CHAdeMO' | 'J1772' | 'Type2' | 'GBT';
export type ChargingLevel = 'L1' | 'L2' | 'DCFC';
export type SiteType = 'public' | 'workplace' | 'fleet' | 'residential' | 'retail' | 'highway_corridor';
export type AccessType = 'public' | 'restricted' | 'private';
export type OperationalStatus = 'active' | 'down' | 'under_maintenance' | 'planned' | 'decommissioned';
export type DataSource = 'field_visit' | 'operator_api' | 'crowdsourced' | 'scraped';
export type LocationAccuracy = 'gps_onsite' | 'geocoded_address' | 'manual_pin';

export interface EVStation {
  id: string;
  customStationId: string;
  locationName: string;
  networkOperator: string;
  addressStreet?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  latitude: number;
  longitude: number;
  locationAccuracy: LocationAccuracy;
  siteType: SiteType;
  numStallsTotal: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface EVStationConnector {
  id: string;
  stationId: string;
  plugType: PlugType;
  chargingLevel: ChargingLevel;
  powerOutputKw: number;
  numConnectors: number;
  ocppVersion?: string;
}

export interface TieredMinuteRate {
  tierName?: string;
  minKw?: number;
  maxKw?: number;
  ratePerMinute: number;
}

export interface EVStationPricing {
  id: string;
  stationId: string;
  connectorId?: string;
  ratePerKwh?: number;
  ratePerMinute?: number;
  ratePerMinuteTiered?: TieredMinuteRate[];
  sessionFee?: number;
  idleFee?: number;
  parkingFee?: number;
  currency: string;
  membershipRequired: boolean;
  membershipNetworkName?: string;
  paymentMethods: string[];
}

export interface EVStationAccess {
  id: string;
  stationId: string;
  accessType: AccessType;
  hoursOfOperation: string;
  reservationAvailable: boolean;
}

export interface EVStationStatusHistory {
  id: string;
  stationId: string;
  operationalStatus: OperationalStatus;
  installDate?: string;
  lastVerifiedDate: string;
  dataSource: DataSource;
  notes?: string;
}

export interface EVStationAmenities {
  id: string;
  stationId: string;
  amenitiesNearby: string[];
  lighting: boolean;
  securityCameras: boolean;
  photoUrl?: string;
}

export interface EVStationFullRecord extends EVStation {
  connectors: EVStationConnector[];
  pricing: EVStationPricing[];
  access?: EVStationAccess;
  latestStatus?: EVStationStatusHistory;
  amenities?: EVStationAmenities;
}
