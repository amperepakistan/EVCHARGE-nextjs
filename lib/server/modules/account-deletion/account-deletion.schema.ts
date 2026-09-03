import { z } from 'zod';

export const createDeletionRequestSchema = z.object({
  reason: z.string().trim().max(1000).optional(),
});

export type CreateDeletionRequestInput = z.infer<typeof createDeletionRequestSchema>;

export const rejectDeletionRequestSchema = z.object({
  adminNote: z.string().trim().min(1, 'Admin note is required').max(1000),
});

export type RejectDeletionRequestInput = z.infer<typeof rejectDeletionRequestSchema>;
