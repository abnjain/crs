import { z } from 'zod';

export const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  startDate: z.date().refine((date) => date instanceof Date && !isNaN(date), { message: 'Invalid start date' }),
  endDate: z.date().refine((date) => date instanceof Date && !isNaN(date), { message: 'Invalid end date' })
    .refine((end) => end > this.startDate, { message: 'End date must be after start date' }),
});