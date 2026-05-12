/**
 * ============================================================
 * Event Request Validators (Zod)
 * Schemas for create and update events
 * ============================================================
 */

import { z } from 'zod';

const eventTypeEnum = z.enum(['seminar', 'workshop', 'reunion', 'webinar', 'conference', 'other']);
const eventStatusEnum = z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']);

const photoUrlSchema = z
  .string()
  .trim()
  .min(1)
  .refine(
    (s) => /^https?:\/\//i.test(s) || /^\/[^\s]+$/.test(s),
    'Each photo must be an http(s) URL or root-relative path'
  );

export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  description: z.string().trim().optional(),
  type: eventTypeEnum.optional().default('other'),
  date: z.string().datetime({ message: 'Invalid date format' }),
  endDate: z.string().datetime({ message: 'Invalid end-date format' }).optional(),
  location: z.string().trim().optional(),
  isOnline: z.boolean().optional().default(false),
  meetLink: z.string().url('Invalid meet link').trim().optional().or(z.literal('')),
  status: eventStatusEnum.optional().default('upcoming'),
  maxAttendees: z.number().int().positive().optional(),
  tags: z.array(z.string().trim()).optional(),
  photos: z.array(photoUrlSchema).max(40).optional(),
});

export const updateEventSchema = createEventSchema.partial();

export type CreateEventBody = z.infer<typeof createEventSchema>;
export type UpdateEventBody = z.infer<typeof updateEventSchema>;
