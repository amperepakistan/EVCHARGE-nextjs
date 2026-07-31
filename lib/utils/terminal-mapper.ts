import type { CreateTerminalInput, UpdateTerminalInput } from '@/lib/validations/terminal';
import type { Database } from '@/types/database.types';

type TerminalInsert = Database['public']['Tables']['terminals']['Insert'];
type TerminalUpdate = Database['public']['Tables']['terminals']['Update'];

/** Map camelCase API/form fields → snake_case DB columns. */
export function toTerminalInsert(input: CreateTerminalInput): TerminalInsert {
  return {
    name: input.name,
    latitude: input.latitude,
    longitude: input.longitude,
    city: input.city,
    address: input.address,
    charger_class: input.chargerClass,
    connector_type: input.connectorType,
    power_kw: input.powerKw,
    price_per_kwh: input.pricePerKwh,
    operating_hours: input.operatingHours,
    phone_number: input.phoneNumber,
    connectivity_tier: input.connectivityTier,
    verification_status: input.verificationStatus,
    current_vendor_id: input.currentVendorId,
    current_owner_id: input.currentOwnerId,
    google_place_id: input.googlePlaceId,
    google_maps_url: input.googleMapsUrl,
    google_rating: input.googleRating,
    google_rating_count: input.googleRatingCount,
    google_photo_urls: input.googlePhotoUrls,
    source: input.source,
    scraped_at: input.scrapedAt,
    last_verified_at: input.lastVerifiedAt,
    is_public: input.isPublic,
  };
}

export function toTerminalUpdate(input: UpdateTerminalInput): TerminalUpdate {
  const row: TerminalUpdate = {};
  if (input.name !== undefined) row.name = input.name;
  if (input.latitude !== undefined) row.latitude = input.latitude;
  if (input.longitude !== undefined) row.longitude = input.longitude;
  if (input.city !== undefined) row.city = input.city;
  if (input.address !== undefined) row.address = input.address;
  if (input.chargerClass !== undefined) row.charger_class = input.chargerClass;
  if (input.connectorType !== undefined) row.connector_type = input.connectorType;
  if (input.powerKw !== undefined) row.power_kw = input.powerKw;
  if (input.pricePerKwh !== undefined) row.price_per_kwh = input.pricePerKwh;
  if (input.operatingHours !== undefined) row.operating_hours = input.operatingHours;
  if (input.phoneNumber !== undefined) row.phone_number = input.phoneNumber;
  if (input.connectivityTier !== undefined) row.connectivity_tier = input.connectivityTier;
  if (input.verificationStatus !== undefined) {
    row.verification_status = input.verificationStatus;
  }
  if (input.currentVendorId !== undefined) row.current_vendor_id = input.currentVendorId;
  if (input.currentOwnerId !== undefined) row.current_owner_id = input.currentOwnerId;
  if (input.googlePlaceId !== undefined) row.google_place_id = input.googlePlaceId;
  if (input.googleMapsUrl !== undefined) row.google_maps_url = input.googleMapsUrl;
  if (input.googleRating !== undefined) row.google_rating = input.googleRating;
  if (input.googleRatingCount !== undefined) {
    row.google_rating_count = input.googleRatingCount;
  }
  if (input.googlePhotoUrls !== undefined) row.google_photo_urls = input.googlePhotoUrls;
  if (input.source !== undefined) row.source = input.source;
  if (input.scrapedAt !== undefined) row.scraped_at = input.scrapedAt;
  if (input.lastVerifiedAt !== undefined) row.last_verified_at = input.lastVerifiedAt;
  if (input.isPublic !== undefined) row.is_public = input.isPublic;
  return row;
}
