// src/schemas/alumniSchemas.js
import { z } from "zod";

// Base schema for alumni profile
export const alumniSchema = z.object({
  enrollmentNo: z.string()
    .min(1, "Enrollment Number is required")
    .max(50, "Enrollment number too long"),
  batch: z.string()
    .min(1, "Batch is required")
    .max(20, "Batch too long"),
  department: z.string()
    .min(1, "Department is required")
    .max(50, "Department name too long"),
  degree: z.string()
    .min(1, "Degree is required")
    .max(50, "Degree name too long"),
  specialization: z.string()
    .max(100, "Specialization too long")
    .optional()
    .or(z.literal("")),
  graduationYear: 
  z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return undefined; // trigger required_error
      const num = Number(val);
      return isNaN(num) ? val : num; // invalid numbers will trigger invalid_type_error
    },
    z.number({
      required_error: "Graduation year is required",
      invalid_type_error: "Graduation year must be a number",
    })
      // .int("Must be a valid year")
      .min(1988, "Year too early")
      .max(2030, "Year too far in future"),
  ),
  currentCompany: z.string()
    .min(1, "Current Company is required")
    .max(100, "Company name too long"),
  currentRole: z.enum(["Employee", "Employer (Owner)"], {
    errorMap: () => ({ message: "Select a valid role" })
  }),
  currentDesignation: z.string()
    .min(1, "Current Designation is required")
    .max(100, "Designation too long"),
  linkedin: z.string()
    .url("Invalid LinkedIn URL")
    .optional()
    .or(z.literal("")),
  location: z.string()
    .max(100, "Location too long")
    .optional()
    .or(z.literal("")),
  about: z.string()
    .max(1000, "About section too long")
    .optional()
    .or(z.literal("")),
  profilePhoto: z.
    string({
      required_error: "Profile photo is required"
    })
    .min(1, "Profile photo is required")
    // .nullable()
    .refine(val => {
      // if (!val) return true;
      return val.startsWith("data:image/") || val.startsWith("http");
    }, "Must be a valid image URL or JPG Image")
});

// Default values for initializing form
export const defaultAlumniValues = {
  enrollmentNo: "",
  batch: "",
  department: "",
  degree: "",
  specialization: "",
  graduationYear: "",
  currentCompany: "",
  currentRole: "",
  currentDesignation: "",
  linkedin: "",
  location: "",
  about: "",
  profilePhoto: "",
};
