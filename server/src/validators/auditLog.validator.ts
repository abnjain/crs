/**
 * ============================================================
 * AuditLog Query Validators (Zod)
 * ============================================================
 */

import { z } from 'zod';

const categoryEnum = z.enum(['auth', 'user', 'alumni', 'event', 'system', 'api']);

export const auditLogQuerySchema = z.object({
  category: categoryEnum.optional(),
  action: z.string().trim().optional(),
  startDate: z.string().trim().optional(),
  endDate: z.string().trim().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(200).optional().default(20),
});

export type AuditLogQuery = z.infer<typeof auditLogQuerySchema>;
