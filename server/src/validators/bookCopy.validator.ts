/**
 * ============================================================
 * BookCopy Request Validators (Zod)
 * ============================================================
 */

import { z } from 'zod';

const statusEnum = z.enum(['available', 'loaned', 'lost', 'maintenance']);
const conditionEnum = z.enum(['new', 'good', 'fair', 'poor']);

export const createBookCopySchema = z.object({
  bookId: z.string().min(1, 'Book ID is required'),
  barcode: z.string().trim().optional(),
  status: statusEnum.optional(),
  condition: conditionEnum.optional(),
  shelfLocation: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  acquiredAt: z.string().datetime({ message: 'Invalid acquiredAt format' }).optional(),
  isActive: z.boolean().optional(),
});

export const updateBookCopySchema = createBookCopySchema.partial();

export type CreateBookCopyBody = z.infer<typeof createBookCopySchema>;
export type UpdateBookCopyBody = z.infer<typeof updateBookCopySchema>;
