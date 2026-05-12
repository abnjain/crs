/**
 * ============================================================
 * SiteConfig Model - Singleton platform settings (MongoDB)
 * ============================================================
 */

import mongoose, { Document, Model, Schema } from 'mongoose';

export type SiteDefaultRole = 'superadmin' | 'admin' | 'hod' | 'faculty' | 'alumni';

export interface ISiteConfig extends Document {
  siteName: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  defaultRole: SiteDefaultRole;
  maxUploadSizeMB: number;
  sessionTimeoutMinutes: number;
  contactEmail: string;
  announcementBanner: string;
  messagingEnabled: boolean;
  alumniCanMessageFaculty: boolean;
  alumniCanMessageAlumni: boolean;
  alumniCanMessageAdmin: boolean;
  facultyMustOptInForAlumniChat: boolean;
}

export interface ISiteConfigModel extends Model<ISiteConfig> {
  getConfig(): Promise<ISiteConfig>;
}

const siteConfigSchema = new Schema<ISiteConfig, ISiteConfigModel>(
  {
    siteName: { type: String, trim: true, default: 'CRS Platform' },
    maintenanceMode: { type: Boolean, default: false },
    registrationEnabled: { type: Boolean, default: true },
    defaultRole: {
      type: String,
      enum: ['superadmin', 'admin', 'hod', 'faculty', 'alumni'],
      default: 'alumni',
    },
    maxUploadSizeMB: { type: Number, default: 10, min: 1, max: 500 },
    sessionTimeoutMinutes: { type: Number, default: 1440, min: 5, max: 10080 },
    contactEmail: { type: String, trim: true, default: '' },
    announcementBanner: { type: String, trim: true, default: '' },
    messagingEnabled: { type: Boolean, default: true },
    alumniCanMessageFaculty: { type: Boolean, default: true },
    alumniCanMessageAlumni: { type: Boolean, default: false },
    alumniCanMessageAdmin: { type: Boolean, default: true },
    facultyMustOptInForAlumniChat: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

siteConfigSchema.statics.getConfig = async function getConfig(this: ISiteConfigModel): Promise<ISiteConfig> {
  let doc = await this.findOne().exec();
  if (!doc) {
    doc = await this.create({});
  }
  return doc;
};

export const SiteConfig: ISiteConfigModel = mongoose.model<ISiteConfig, ISiteConfigModel>(
  'SiteConfig',
  siteConfigSchema
);
