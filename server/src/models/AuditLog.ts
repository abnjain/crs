/**
 * ============================================================
 * AuditLog Model - Persisted audit trail for API and domain actions
 * ============================================================
 */

import mongoose, { Document, Model, Schema } from 'mongoose';

export type AuditCategory =
  | 'auth'
  | 'user'
  | 'alumni'
  | 'event'
  | 'document'
  | 'library'
  | 'system'
  | 'api';

export interface IAuditLog extends Document {
  action: string;
  category: AuditCategory;
  actor?: mongoose.Types.ObjectId;
  actorEmail: string;
  targetModel?: string;
  targetId?: mongoose.Types.ObjectId;
  method: string;
  path: string;
  statusCode: number;
  ip: string;
  userAgent: string;
  details?: Record<string, unknown>;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    action: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['auth', 'user', 'alumni', 'event', 'document', 'library', 'system', 'api'],
      required: true,
    },
    actor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    actorEmail: { type: String, trim: true, default: '' },
    targetModel: { type: String, trim: true },
    targetId: {
      type: Schema.Types.ObjectId,
    },
    method: { type: String, required: true, trim: true, uppercase: true },
    path: { type: String, required: true, trim: true },
    statusCode: { type: Number, required: true },
    ip: { type: String, trim: true, default: '' },
    userAgent: { type: String, trim: true, default: '' },
    details: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ category: 1, createdAt: -1 });
auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

export const AuditLog: Model<IAuditLog> = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
