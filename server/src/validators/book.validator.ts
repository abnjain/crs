/**
 * ============================================================
 * Book Request Validators (Zod)
 * ============================================================
 */

import { z } from 'zod';

export const createBookSchema = z.object({
  isbn: z.string().min(1, 'ISBN is required').trim(),
  title: z.string().min(1, 'Title is required').trim(),
  subtitle: z.string().trim().optional(),
  authors: z.array(z.string().trim()).optional(),
  publisher: z.string().trim().optional(),
  publishYear: z.number().int().min(1400).max(2100).optional(),
  edition: z.string().trim().optional(),
  language: z.string().trim().optional(),
  categories: z.array(z.string().trim()).optional(),
  description: z.string().trim().optional(),
  coverImage: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});

export const updateBookSchema = createBookSchema.partial();

export type CreateBookBody = z.infer<typeof createBookSchema>;
export type UpdateBookBody = z.infer<typeof updateBookSchema>;
