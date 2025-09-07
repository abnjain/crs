// src/schemas/authSchemas.js
import { z } from "zod";

// Shared password schema
const passwordSchema = z
  .string()
  .min(6, { message: "Password must be at least 6 characters long" })
  .max(50, { message: "Password is too long" });

// ✅ Login schema
export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: passwordSchema,
});

// ✅ Register schema (extends login schema)
export const registerSchema = loginSchema
  .extend({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    phone: z.string().regex(/^[0-9]{10}$/, { message: "Phone must be 10 digits" }),
    role: z.enum(["Student", "Teacher", "Staff"], { required_error: "Role is required" }),
    confirmPassword: passwordSchema,
  })
  .superRefine((data, ctx) => {
    if (data.confirmPassword !== data.password) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: "custom",
        message: "Passwords must match",
      });
    }
  });
