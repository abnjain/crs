import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(6, { message: "Password must be 6+ characters" }),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, { message: "Name required" }),
    phone: z.string().length(10, { message: "Phone number must be 10 digits" }),
    email: z.string().email({ message: "Invalid email" }),
    password: z.string().min(6, { message: "Password must be 6+ characters" }),
    confirmPassword: z.string().min(6, { message: "Password must be 6+ characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // ❗ error will show up under confirmPassword field
  });
