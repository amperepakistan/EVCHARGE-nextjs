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
  connectivityTier: z
    .enum(['listed', 'sensor_augmented', 'connected_demo', 'connected_live'])
    .optional(),
  currentVendorId: z.string().uuid().nullable().optional(),
  currentOwnerId: z.string().uuid().nullable().optional(),
  source: z.enum(['scraped', 'manual', 'vendor_submitted']).optional(),
  isPublic: z.boolean().optional(),
});

export const updateTerminalSchema = createTerminalSchema.partial();

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type CreateTerminalInput = z.infer<typeof createTerminalSchema>;
export type UpdateTerminalInput = z.infer<typeof updateTerminalSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
