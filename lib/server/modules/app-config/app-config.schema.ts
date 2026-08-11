import { z } from 'zod';

const semver = z
  .string()
  .regex(/^\d+\.\d+\.\d+$/, 'Must be a semver string, e.g. 1.4.2');

export const updatePlatformConfigSchema = z.object({
  minVersion: semver,
  minBuildNumber: z.coerce.number().int().min(1),
  latestVersion: semver,
  latestBuildNumber: z.coerce.number().int().min(1),
  forceUpdate: z.coerce.boolean(),
  storeUrl: z.string().url().optional().or(z.literal('')),
});

export type UpdatePlatformConfigInput = z.infer<typeof updatePlatformConfigSchema>;

export const updateMaintenanceSchema = z.object({
  enabled: z.coerce.boolean(),
  message: z.string().max(500).optional().or(z.literal('')),
});

export type UpdateMaintenanceInput = z.infer<typeof updateMaintenanceSchema>;
