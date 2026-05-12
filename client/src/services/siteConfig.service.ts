/**
 * ============================================================
 * Site config API client (singleton MongoDB settings)
 * ============================================================
 */

import { api } from './api';

export interface SiteConfigRecord {
  siteName: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  defaultRole: string;
  maxUploadSizeMB: number;
  sessionTimeoutMinutes: number;
  contactEmail: string;
  announcementBanner: string;
  messagingEnabled?: boolean;
  alumniCanMessageFaculty?: boolean;
  alumniCanMessageAlumni?: boolean;
  alumniCanMessageAdmin?: boolean;
  facultyMustOptInForAlumniChat?: boolean;
}

export interface SiteConfigResponse {
  success: boolean;
  config: SiteConfigRecord & { _id: string; createdAt?: string; updatedAt?: string };
}

export const siteConfigService = {
  async get(): Promise<SiteConfigRecord & { _id: string }> {
    const { data } = await api.get<SiteConfigResponse>('/v1/site-config');
    return data.config;
  },

  async update(body: Partial<SiteConfigRecord>): Promise<SiteConfigRecord & { _id: string }> {
    const { data } = await api.patch<SiteConfigResponse>('/v1/site-config', body);
    return data.config;
  },
};
