/**
 * ============================================================
 * Messaging Validators (Zod)
 * ============================================================
 */

import { z } from 'zod';

const objectIdString = z
  .string()
  .trim()
  .length(24)
  .regex(/^[a-fA-F0-9]{24}$/, 'Invalid id');

export const createDirectConversationSchema = z.object({
  participantId: objectIdString,
});

export const sendMessageBodySchema = z.object({
  content: z.string().min(1, 'Message is required').max(8000).trim(),
});

export const archiveConversationSchema = z.object({
  archived: z.boolean(),
});

export const messagingOptInSchema = z.object({
  messagingOptIn: z.boolean(),
});

export const broadcastBodySchema = z.object({
  title: z.string().min(1).max(200).trim(),
  content: z.string().min(1).max(8000).trim(),
  recipientUserIds: z.array(objectIdString).optional(),
  filters: z
    .object({
      department: z.string().trim().optional(),
      batch: z.string().trim().optional(),
      graduationYear: z.coerce.number().int().optional(),
      allAlumni: z.boolean().optional(),
    })
    .optional(),
});

export const banMessagingSchema = z.object({
  banned: z.boolean(),
  reason: z.string().trim().max(500).optional(),
});

export type CreateDirectConversationBody = z.infer<typeof createDirectConversationSchema>;
export type SendMessageBody = z.infer<typeof sendMessageBodySchema>;
export type BroadcastBody = z.infer<typeof broadcastBodySchema>;
