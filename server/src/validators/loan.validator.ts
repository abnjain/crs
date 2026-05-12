/**
 * ============================================================
 * Loan Request Validators (Zod)
 * ============================================================
 */

import { z } from 'zod';

export const createLoanSchema = z
  .object({
    borrowerId: z.string().min(1, 'Borrower ID is required'),
    copyId: z.string().min(1).optional(),
    isbn: z.string().min(1).optional(),
  })
  .refine((data) => Boolean(data.copyId || data.isbn), {
    message: 'copyId or isbn is required',
    path: ['copyId'],
  });

export const returnLoanSchema = z.object({
  returnedAt: z.string().datetime({ message: 'Invalid returnedAt format' }).optional(),
});

export const renewLoanSchema = z.object({});

export type CreateLoanBody = z.infer<typeof createLoanSchema>;
export type ReturnLoanBody = z.infer<typeof returnLoanSchema>;
export type RenewLoanBody = z.infer<typeof renewLoanSchema>;
