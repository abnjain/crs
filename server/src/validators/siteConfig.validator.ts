/**
 * ============================================================
 * SiteConfig Validators (Zod)
 * ============================================================
 */

import { z } from 'zod';

const defaultRoleEnum = z.enum(['superadmin', 'admin', 'hod', 'faculty', 'alumni']);

export const updateSiteConfigSchema = z.object({
  siteName: z.string().min(1).trim().optional(),
  maintenanceMode: z.boolean().optional(),
  registrationEnabled: z.boolean().optional(),
  defaultRole: defaultRoleEnum.optional(),
  maxUploadSizeMB: z.number().int().min(1).max(500).optional(),
  sessionTimeoutMinutes: z.number().int().min(5).max(10080).optional(),
  contactEmail: z.union([z.string().email(), z.literal('')]).optional(),
  announcementBanner: z.string().optional(),
  messagingEnabled: z.boolean().optional(),
  alumniCanMessageFaculty: z.boolean().optional(),
  alumniCanMessageAlumni: z.boolean().optional(),
  alumniCanMessageAdmin: z.boolean().optional(),
  facultyMustOptInForAlumniChat: z.boolean().optional(),
});

export type UpdateSiteConfigBody = z.infer<typeof updateSiteConfigSchema>;
