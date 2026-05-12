/**
 * ============================================================
 * Hold Request Validators (Zod)
 * ============================================================
 */

import { z } from 'zod';

const statusEnum = z.enum(['active', 'fulfilled', 'canceled', 'expired']);

export const createHoldSchema = z.object({
  borrowerId: z.string().min(1, 'Borrower ID is required'),
  bookId: z.string().min(1, 'Book ID is required'),
  status: statusEnum.optional(),
  placedAt: z.string().datetime({ message: 'Invalid placedAt format' }).optional(),
  expiresAt: z.string().datetime({ message: 'Invalid expiresAt format' }).optional(),
  notes: z.string().trim().optional(),
});

export const updateHoldSchema = createHoldSchema.partial();

export type CreateHoldBody = z.infer<typeof createHoldSchema>;
export type UpdateHoldBody = z.infer<typeof updateHoldSchema>;
