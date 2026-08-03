/**
 * Locations with no charger nearby — the vendor's pitch list for investors
 * and prospective terminal owners. No schema table exists for this; it's a
 * derived view over population centres vs. `mockTerminals` coverage.
 */
export interface MockOpportunity {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  category: 'mall' | 'highway' | 'corporate' | 'hospitality' | 'residential';
  /** Distance to the nearest charger we already operate. */
  nearestChargerKm: number;
  estimatedDailyTraffic: string;
  pitch: string;
}

export const mockOpportunities: MockOpportunity[] = [
  {
    id: 'opp-lucky-one',
    name: 'Lucky One Mall',
    city: 'Karachi',
    latitude: 24.9204,
    longitude: 67.0989,
    category: 'mall',
    nearestChargerKm: 8.4,
    estimatedDailyTraffic: '18,000 footfall/day',
    pitch: 'Largest mall in the city with zero EV infrastructure — direct competitor to Dolmen.',
  },
  {
    id: 'opp-packages-mall',
    name: 'Packages Mall',
    city: 'Lahore',
    latitude: 31.4697,
    longitude: 74.2728,
    category: 'mall',
    nearestChargerKm: 6.1,
    estimatedDailyTraffic: '12,000 footfall/day',
    pitch: 'Premium retail catchment, no charger within 6 km.',
  },
  {
    id: 'opp-m2-sukheki',
    name: 'M-2 Sukheki Service Area',
    city: 'Sukheki',
    latitude: 31.9667,
    longitude: 73.75,
    category: 'highway',
    nearestChargerKm: 62,
    estimatedDailyTraffic: '4,200 vehicles/day',
    pitch: 'Motorway dead zone between Lahore and Islamabad — closest fast charger is 62 km away.',
  },
  {
    id: 'opp-serena-isb',
    name: 'Islamabad Serena Hotel',
    city: 'Islamabad',
    latitude: 33.7093,
    longitude: 73.0913,
    category: 'hospitality',
    nearestChargerKm: 4.2,
    estimatedDailyTraffic: 'High-value guests, low volume',
    pitch: 'Diplomatic-enclave hotel guests are the highest-margin driver segment.',
  },
  {
    id: 'opp-bahria-town',
    name: 'Bahria Town Phase 8',
    city: 'Rawalpindi',
    latitude: 33.5227,
    longitude: 73.1631,
    category: 'residential',
    nearestChargerKm: 9.7,
    estimatedDailyTraffic: '45,000 residents',
    pitch: 'Large gated community with rising EV adoption and no on-site charging.',
  },
  {
    id: 'opp-arfa-tower',
    name: 'Arfa Software Technology Park',
    city: 'Lahore',
    latitude: 31.4805,
    longitude: 74.3436,
    category: 'corporate',
    nearestChargerKm: 5.3,
    estimatedDailyTraffic: '6,000 employees',
    pitch: 'Tech-sector employer campus — early-adopter demographic for EVs.',
  },
  {
    id: 'opp-m5-sadiqabad',
    name: 'M-5 Sadiqabad Interchange',
    city: 'Sadiqabad',
    latitude: 28.3091,
    longitude: 70.1286,
    category: 'highway',
    nearestChargerKm: 71,
    estimatedDailyTraffic: '3,600 vehicles/day',
    pitch: 'Longest gap on the Karachi–Lahore motorway corridor with no coverage.',
  },
];

export function opportunitiesNear(threshholdKm = 5): MockOpportunity[] {
  return mockOpportunities.filter((o) => o.nearestChargerKm >= threshholdKm);
}
