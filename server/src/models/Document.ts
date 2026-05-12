/**
 * ============================================================
 * Document Model - file uploads with access controls
 * ============================================================
 */

import mongoose, { Document, Model, Schema } from 'mongoose';

export type DocumentKind = 'document' | 'research';
export type DocumentVisibility = 'private' | 'shared';
export type StorageProvider = 'local' | 's3';
export type DocumentAudienceRole = 'hod' | 'faculty' | 'alumni';

export interface IDocument extends Document {
  title: string;
  description?: string;
  kind: DocumentKind;
  owner: mongoose.Types.ObjectId;
  visibility: DocumentVisibility;
  shareAll: boolean;
  audienceRoles: DocumentAudienceRole[];
  audienceUsers: mongoose.Types.ObjectId[];
  storageProvider: StorageProvider;
  storageKey: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

const documentSchema = new Schema<IDocument>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    kind: {
      type: String,
      enum: ['document', 'research'],
      default: 'document',
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
    },
    visibility: {
      type: String,
      enum: ['private', 'shared'],
      default: 'shared',
    },
    shareAll: {
      type: Boolean,
      default: false,
    },
    audienceRoles: {
      type: [String],
      enum: ['hod', 'faculty', 'alumni'],
      default: ['faculty'],
    },
    audienceUsers: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    storageProvider: {
      type: String,
      enum: ['local', 's3'],
      default: 'local',
    },
    storageKey: {
      type: String,
      required: [true, 'Storage key is required'],
      trim: true,
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
      trim: true,
    },
    sizeBytes: {
      type: Number,
      required: [true, 'File size is required'],
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

documentSchema.index({ owner: 1, createdAt: -1 });
documentSchema.index({ visibility: 1, shareAll: 1 });
documentSchema.index({ audienceRoles: 1 });

documentSchema.pre('save', function () {
  if (this.visibility === 'private') {
    this.shareAll = false;
    this.audienceRoles = [];
    this.audienceUsers = [];
  }
});

export const DocumentModel: Model<IDocument> = mongoose.model<IDocument>('Document', documentSchema);
