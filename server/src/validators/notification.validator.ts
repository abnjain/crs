/**
 * ============================================================
 * Notification Request Validators (Zod)
 * ============================================================
 */

import { z } from 'zod';

const notificationTypeEnum = z.enum(['message', 'event', 'document', 'fee', 'system']);
const userRoleEnum = z.enum(['superadmin', 'admin', 'hod', 'faculty', 'alumni']);

export const broadcastNotificationSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  message: z.string().min(1, 'Message is required').trim(),
  type: notificationTypeEnum.optional().default('system'),
  link: z.string().trim().optional(),
  roles: z.array(userRoleEnum).optional(),
  userIds: z.array(z.string().trim().min(1)).optional(),
  data: z.record(z.string(), z.unknown()).optional(),
});

export type BroadcastNotificationBody = z.infer<typeof broadcastNotificationSchema>;
