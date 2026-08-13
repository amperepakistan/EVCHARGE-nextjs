export const SCOUT_AMENITY_FLAG = '__ampere_scout__';

export function scoutAmenities(userId: string, notes?: string): string[] {
  const trimmed = notes?.trim();
  return [
    SCOUT_AMENITY_FLAG,
    `user:${userId}`,
    ...(trimmed ? [`notes:${trimmed}`] : []),
  ];
}

export function parseScoutAmenities(amenities: unknown): {
  kind?: string;
  submittedByUserId?: string;
  notes?: string;
} {
  if (!Array.isArray(amenities)) return {};
  const strings = amenities.filter((value): value is string => typeof value === 'string');
  if (!strings.includes(SCOUT_AMENITY_FLAG)) return {};
  return {
    kind: 'driver_submitted',
    submittedByUserId: strings.find((s) => s.startsWith('user:'))?.slice('user:'.length),
    notes: strings.find((s) => s.startsWith('notes:'))?.slice('notes:'.length),
  };
}
