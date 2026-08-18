/**
 * Locations with no charger nearby — vendor pitch list for screenshots.
 */
export interface MockOpportunity {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  category: 'mall' | 'highway' | 'corporate' | 'hospitality' | 'residential';
  nearestChargerKm: number;
  estimatedDailyTraffic: string;
  pitch: string;
}

export const mockOpportunities: MockOpportunity[] = [
  {
    id: 'opp-lucky-one',
    name: 'Muscat Grand Mall',
    city: 'Muscat',
    latitude: 23.5895,
    longitude: 58.545,
    category: 'mall',
    nearestChargerKm: 8.4,
    estimatedDailyTraffic: '14,000 footfall/day',
    pitch: 'Ruwi retail catchment with no destination charging — closest hub is Qurum.',
  },
  {
    id: 'opp-packages-mall',
    name: 'Oasis Mall Sohar',
    city: 'Sohar',
    latitude: 24.347,
    longitude: 56.708,
    category: 'mall',
    nearestChargerKm: 6.1,
    estimatedDailyTraffic: '8,000 footfall/day',
    pitch: 'North Batinah retail, no charger within 6 km of the mall.',
  },
  {
    id: 'opp-m2-sukheki',
    name: 'Batinah Expressway Liwa',
    city: 'Liwa',
    latitude: 24.536,
    longitude: 56.565,
    category: 'highway',
    nearestChargerKm: 62,
    estimatedDailyTraffic: '4,200 vehicles/day',
    pitch: 'Highway dead zone between Sohar and the UAE border — closest fast charger is 62 km away.',
  },
  {
    id: 'opp-serena-isb',
    name: 'Al Bustan Palace',
    city: 'Muscat',
    latitude: 23.575,
    longitude: 58.608,
    category: 'hospitality',
    nearestChargerKm: 4.2,
    estimatedDailyTraffic: 'High-value guests, low volume',
    pitch: 'Resort guests are the highest-margin driver segment on the coast.',
  },
  {
    id: 'opp-bahria-town',
    name: 'Madinat Al Irfan',
    city: 'Muscat',
    latitude: 23.58,
    longitude: 58.165,
    category: 'residential',
    nearestChargerKm: 9.7,
    estimatedDailyTraffic: '32,000 residents',
    pitch: 'New mixed-use city with rising EV adoption and no on-site charging.',
  },
  {
    id: 'opp-arfa-tower',
    name: 'Knowledge Oasis Muscat',
    city: 'Muscat',
    latitude: 23.58,
    longitude: 58.145,
    category: 'corporate',
    nearestChargerKm: 5.3,
    estimatedDailyTraffic: '4,500 employees',
    pitch: 'Tech-park campus — early-adopter demographic for EVs.',
  },
  {
    id: 'opp-m5-sadiqabad',
    name: 'Duqm SEZ corridor',
    city: 'Duqm',
    latitude: 19.65,
    longitude: 57.7,
    category: 'highway',
    nearestChargerKm: 71,
    estimatedDailyTraffic: '2,800 vehicles/day',
    pitch: 'Longest gap on the Muscat–Duqm highway with almost no coverage.',
  },
];

export function opportunitiesNear(threshholdKm = 5): MockOpportunity[] {
  return mockOpportunities.filter((o) => o.nearestChargerKm >= threshholdKm);
}
