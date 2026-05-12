/**
 * ============================================================
 * Auth Request Validators (Zod)
 * Schemas for register and login
 * ============================================================
 */

import { z } from 'zod';

/** Only faculty and alumni can self-register — admins/hod/superadmin are created by existing admins */
const registerRoleSchema = z.enum(['faculty', 'alumni']);

// Schema used by admins to create users with any role
const adminCreateRoleSchema = z.enum(['superadmin', 'admin', 'hod', 'faculty', 'alumni']);

export const registerBodySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').trim(),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: registerRoleSchema.optional().default('alumni'),
});

export const adminCreateBodySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').trim(),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: adminCreateRoleSchema.optional().default('alumni'),
  roles: z.array(adminCreateRoleSchema).min(1).optional(),
});

export const loginBodySchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export const updateMeBodySchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').trim().optional(),
    email: z.string().email('Invalid email address').toLowerCase().trim().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const deleteMeBodySchema = z.object({
  password: z.string().min(1, 'Password is required'),
  confirm: z.literal('DELETE', {
    errorMap: () => ({ message: 'Type DELETE to confirm' }),
  }),
  deleteDocuments: z.boolean().optional(),
});

export const requestEmailVerificationBodySchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
});

export const verifyEmailBodySchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter the 6-digit verification code'),
});

export type RegisterBody = z.infer<typeof registerBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;
export type UpdateMeBody = z.infer<typeof updateMeBodySchema>;
export type DeleteMeBody = z.infer<typeof deleteMeBodySchema>;
export type RequestEmailVerificationBody = z.infer<typeof requestEmailVerificationBodySchema>;
export type VerifyEmailBody = z.infer<typeof verifyEmailBodySchema>;
