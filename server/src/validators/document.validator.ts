/**
 * ============================================================
 * Document Request Validators (Zod)
 * ============================================================
 */

import { z } from 'zod';

export const documentKindEnum = z.enum(['document', 'research']);
export const documentVisibilityEnum = z.enum(['private', 'shared']);
export const documentAudienceRoleEnum = z.enum(['hod', 'faculty', 'alumni']);
export const storageProviderEnum = z.enum(['local', 's3']);

export const createDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  description: z.string().trim().optional(),
  kind: documentKindEnum.default('document'),
  visibility: documentVisibilityEnum.default('shared'),
  shareAll: z.boolean().default(false),
  audienceRoles: z.array(documentAudienceRoleEnum).default(['faculty']),
  audienceUsers: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).default([]),
  storageProvider: storageProviderEnum.default('local'),
});

export const updateDocumentSchema = createDocumentSchema.partial();

export type CreateDocumentBody = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentBody = z.infer<typeof updateDocumentSchema>;
