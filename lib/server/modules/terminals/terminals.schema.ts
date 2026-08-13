import { z } from 'zod';

export const createTerminalSchema = z.object({
  name: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  city: z.string().optional(),
  address: z.string().optional(),
  chargerClass: z.enum(['AC', 'DC']).optional(),
  connectorType: z.string().optional(),
  powerKw: z.number().positive().optional(),
  pricePerKwh: z.number().nonnegative().optional(),
  operatingHours: z.string().optional(),
  phoneNumber: z.string().optional(),
  connectivityTier: z
    .enum(['listed', 'sensor_augmented', 'connected_demo', 'connected_live'])
    .optional(),
  verificationStatus: z.enum(['unverified', 'verified', 'flagged']).optional(),
  currentVendorId: z.string().uuid().nullable().optional(),
  currentOwnerId: z.string().uuid().nullable().optional(),
  googlePlaceId: z.string().optional(),
  googleMapsUrl: z.string().url().optional(),
  googleRating: z.number().min(0).max(5).optional(),
  googleRatingCount: z.number().int().nonnegative().optional(),
  googlePhotoUrls: z.array(z.string().url()).optional(),
  source: z
    .enum([
      'scraped',
      'manual',
      'vendor_submitted',
      'google_places',
      'open_charge_map',
      'driver_submitted',
    ])
    .optional(),
  scrapedAt: z.string().datetime().optional(),
  lastVerifiedAt: z.string().datetime().optional(),
  isPublic: z.boolean().optional(),
  submittedByUserId: z.string().uuid().nullable().optional(),
  submissionNotes: z.string().max(2000).optional(),
});

export const updateTerminalSchema = createTerminalSchema.partial();

export const suggestTerminalSchema = z.object({
  name: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  city: z.string().optional(),
  address: z.string().optional(),
  connectorType: z.string().optional(),
  chargerClass: z.enum(['AC', 'DC']).optional(),
  notes: z.string().max(2000).optional(),
});

export type CreateTerminalInput = z.infer<typeof createTerminalSchema>;
export type UpdateTerminalInput = z.infer<typeof updateTerminalSchema>;
export type SuggestTerminalInput = z.infer<typeof suggestTerminalSchema>;
