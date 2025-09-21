import { z } from "zod";

// Zod schema based on AlumnusSchema with integrated default values
export const alumniSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name too long")
    .default(""),
  
  email: z.string()
    .email("Invalid email format")
    .optional()
    .default(""),
  
  phone: z.string()
    .max(20, "Phone number too long")
    .optional()
    .default(""),
  
  enrollmentNo: z.string()
    .max(50, "Enrollment number too long")
    .optional()
    .default(""),
  
  batch: z.string()
    .max(20, "Batch too long")
    .optional()
    .default(""),
  
  department: z.string()
    .max(50, "Department name too long")
    .optional()
    .default(""),
  
  degree: z.string()
    .max(50, "Degree name too long")
    .optional()
    .default(""),
  
  specialization: z.string()
    .max(100, "Specialization too long")
    .optional()
    .default(""),
  
  graduationYear: z.number()
    .int("Must be a valid year")
    .min(1900, "Year too early")
    .max(2100, "Year too far in future")
    .optional()
    .default(null),
  
  currentCompany: z.string()
    .max(100, "Company name too long")
    .optional()
    .default(""),
  
  currentRole: z.string()
    .max(100, "Role too long")
    .optional()
    .default(""),
  
  linkedin: z.string()
    .url("Invalid LinkedIn URL")
    .optional()
    .default(""),
  
  location: z.string()
    .max(100, "Location too long")
    .optional()
    .default(""),
  
  about: z.string()
    .max(1000, "About section too long")
    .optional()
    .default(""),
  
  experiences: z.array(
    z.object({
      company: z.string()
        .max(100, "Company name too long")
        .optional()
        .default(""),
      
      role: z.string()
        .max(100, "Role too long")
        .optional()
        .default(""),
      
      startDate: z.date()
        .optional()
        .default(null),
      
      endDate: z.date()
        .optional()
        .default(null),
      
      currentlyWorking: z.boolean()
        .default(false),
      
      description: z.string()
        .max(500, "Description too long")
        .optional()
        .default(""),
    }).refine((exp) => {
      // At least one field should be filled for valid experience
      return exp.company || exp.role || exp.description;
    }, {
      message: "At least company, role, or description should be provided"
    })
  ).optional()
  .default([]),
  
  tags: z.array(z.string())
    .max(20, "Maximum 20 tags allowed")
    .optional()
    .default([]),
  
  visibility: z.enum(["public", "private"])
    .default("public"),
});

// Create a schema for new alumni (with minimal required fields)
export const newAlumniSchema = alumniSchema.omit({ 
  name: true // Keep name as required
}).extend({
  name: z.string().min(1, "Name is required").max(100, "Name too long")
});

// Create a schema for editing alumni (all fields optional except ID)
export const editAlumniSchema = alumniSchema.partial().extend({
  name: z.string().min(1, "Name is required").max(100, "Name too long")
});

// Transform function to handle tags conversion and cleanup
export const transformData = (data) => {
  const cleanedData = { ...data };
  
  // Handle tags conversion from string to array
  if (cleanedData.tags && typeof cleanedData.tags === 'string') {
    cleanedData.tags = cleanedData.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
      .slice(0, 20); // Limit to 20 tags
  }
  
  // Clean up empty experiences
  if (cleanedData.experiences && Array.isArray(cleanedData.experiences)) {
    cleanedData.experiences = cleanedData.experiences.filter(exp => 
      exp.company?.trim() || exp.role?.trim() || exp.description?.trim()
    );
  }
  
  // Remove empty strings and null values for optional fields
  Object.keys(cleanedData).forEach(key => {
    if (cleanedData[key] === "" || cleanedData[key] === null) {
      if ([
        'email', 'phone', 'enrollmentNo', 'batch', 'department', 
        'degree', 'specialization', 'currentCompany', 'currentRole', 
        'linkedin', 'location', 'about'
      ].includes(key)) {
        delete cleanedData[key]; // Remove empty optional fields
      }
    }
  });
  
  return cleanedData;
};

// Default values object for form initialization
export const defaultAlumniValues = {
  name: "",
  email: "",
  phone: "",
  enrollmentNo: "",
  batch: "",
  department: "",
  degree: "",
  specialization: "",
  graduationYear: null,
  currentCompany: "",
  currentRole: "",
  linkedin: "",
  location: "",
  about: "",
  experiences: [],
  tags: [],
  visibility: "public",
};

// Safe form initializer
export const initializeForm = (defaultValues = {}) => {
  const safeDefaults = { ...defaultAlumniValues, ...defaultValues };
  
  // Ensure experiences is always an array
  safeDefaults.experiences = Array.isArray(safeDefaults.experiences) 
    ? safeDefaults.experiences 
    : [];
  
  // Ensure tags is always an array
  safeDefaults.tags = Array.isArray(safeDefaults.tags) 
    ? safeDefaults.tags 
    : [];
  
  return safeDefaults;
};