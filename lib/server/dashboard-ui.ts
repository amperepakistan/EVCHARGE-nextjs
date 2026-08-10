import type { Json } from '@/types/database.types';

export function amenitiesList(amenities: Json | null | undefined): string[] {
  if (!Array.isArray(amenities)) return [];
  return amenities.filter((a): a is string => typeof a === 'string');
}

export function photoUrl(urls: string[] | null | undefined): string | null {
  return urls?.[0] ?? null;
}
