import { z } from 'zod';

export const adminResetPasswordSchema = z.object({
  password: z.string().min(8).max(128),
});

export const adminUpdateEmailSchema = z.object({
  email: z.string().email().max(254),
});
