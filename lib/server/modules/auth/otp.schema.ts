import { z } from 'zod';
import { normalizePkMobile } from '@/lib/server/modules/auth/phone';

/**
 * Phone inputs are normalized to E.164 during parsing, so every layer below
 * the schema only ever sees `+92XXXXXXXXXX`.
 */
const pkPhone = z
  .string()
  .min(7)
  .max(24)
  .transform((value, ctx) => {
    const normalized = normalizePkMobile(value);
    if (!normalized) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enter a valid Pakistani mobile number (+92 3XX XXXXXXX)',
      });
      return z.NEVER;
    }
    return normalized;
  });

export const requestOtpSchema = z.object({
  phoneNumber: pkPhone,
});

export const verifyOtpSchema = z.object({
  phoneNumber: pkPhone,
  code: z
    .string()
    .trim()
    .regex(/^\d{4}$/, 'Enter the 4-digit code'),
  /** Optional display name captured on the first sign-in. */
  fullName: z.string().trim().min(1).max(120).optional(),
});

export type RequestOtpInput = z.infer<typeof requestOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
