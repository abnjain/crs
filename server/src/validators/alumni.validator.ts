/**
 * ============================================================
 * Alumni Request Validators (Zod)
 * Schemas for create and update alumni profiles
 * ============================================================
 */

import { z } from 'zod';

export const createAlumniSchema = z.object({
  user: z.string().min(1, 'User ID is required'),
  graduationYear: z.number().int().min(1950).max(2100),
  batch: z.string().trim().optional(),
  department: z.string().min(1, 'Department is required').trim(),
  company: z.string().trim().optional(),
  designation: z.string().trim().optional(),
  location: z.string().trim().optional(),
  address: z.string().trim().optional(),
  linkedIn: z.string().url('Invalid LinkedIn URL').trim().optional().or(z.literal('')),
  phone: z.string().trim().optional(),
  bio: z.string().trim().optional(),
  isVerified: z.boolean().optional(),
});

export const updateAlumniSchema = createAlumniSchema.omit({ user: true }).partial();

export const selfAlumniUpsertSchema = createAlumniSchema
  .omit({ user: true, isVerified: true })
  .partial();

export type CreateAlumniBody = z.infer<typeof createAlumniSchema>;
export type UpdateAlumniBody = z.infer<typeof updateAlumniSchema>;
export type SelfAlumniUpsertBody = z.infer<typeof selfAlumniUpsertSchema>;
