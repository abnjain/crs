/**
 * ============================================================
 * Fee Request Validators (Zod)
 * ============================================================
 */

import { z } from 'zod';

const statusEnum = z.enum(['applied', 'waived', 'paid']);

export const createFeeSchema = z.object({
  borrowerId: z.string().min(1, 'Borrower ID is required'),
  loanId: z.string().min(1).optional(),
  amount: z.number().positive('Amount must be greater than 0'),
  currency: z.string().trim().optional(),
  reason: z.string().min(1, 'Reason is required').trim(),
  status: statusEnum.optional(),
});

export const updateFeeSchema = createFeeSchema.partial();

export const waiveFeeSchema = z.object({
  reason: z.string().min(3, 'Waiver reason is required').trim(),
});

export type CreateFeeBody = z.infer<typeof createFeeSchema>;
export type UpdateFeeBody = z.infer<typeof updateFeeSchema>;
export type WaiveFeeBody = z.infer<typeof waiveFeeSchema>;
