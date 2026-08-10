import { z } from 'zod';

export const patchDriverSchema = z.object({
  fullName: z.string().min(1).max(120).optional(),
  phoneNumber: z.string().min(7).max(32).nullable().optional(),
  preferredVehicleKey: z.string().min(1).max(80).nullable().optional(),
});

export type PatchDriverInput = z.infer<typeof patchDriverSchema>;
