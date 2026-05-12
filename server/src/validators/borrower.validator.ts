/**
 * ============================================================
 * Borrower Request Validators (Zod)
 * ============================================================
 */

import { z } from 'zod';

export const createBorrowerSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required').trim(),
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Invalid email').trim().optional().or(z.literal('')),
  department: z.string().trim().optional(),
  program: z.string().trim().optional(),
  batch: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  externalRef: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});

export const updateBorrowerSchema = createBorrowerSchema.partial();

export type CreateBorrowerBody = z.infer<typeof createBorrowerSchema>;
export type UpdateBorrowerBody = z.infer<typeof updateBorrowerSchema>;
