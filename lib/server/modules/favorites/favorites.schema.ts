import { z } from 'zod';

export const addFavoriteSchema = z.object({
  terminalId: z.string().uuid(),
});

export type AddFavoriteInput = z.infer<typeof addFavoriteSchema>;
