import { z } from 'zod';

export const eventSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    startDate: z.date({ required_error: "Start date is required" }),
    endDate: z.date({ required_error: "End date is required" }),
  })
  .refine((data) => data.endDate >= data.startDate, {
    path: ["endDate"],
    message: "End date must be after start date",
  });