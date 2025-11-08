import { z } from "zod";

export const teacherSchema = z.object({
    empCode: z.string().min(1, "Employee Code is required"),
    deptId: z.string().min(1, "Department ID is required"),
    designation: z.string().min(1, "Designation is required"),
    expertise: z.array(z.string()).min(1, "At least one expertise is required"),
    achievements: z.array(z.string()).optional(),
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    bio: z.string().optional(),
    expertise: z.array(z.string()).default([]),
    achievements: z.array(z.string()).default([]),
});