/**
 * ============================================================
 * Notification Model - user notifications with read state
 * ============================================================
 */

import mongoose, { Document, Model, Schema } from 'mongoose';

export type NotificationType = 'message' | 'event' | 'document' | 'fee' | 'system';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  actor?: mongoose.Types.ObjectId;
  sourceModel?: string;
  sourceId?: mongoose.Types.ObjectId;
  data?: Record<string, unknown>;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['message', 'event', 'document', 'fee', 'system'],
      default: 'system',
    },
    link: { type: String, trim: true },
    actor: { type: Schema.Types.ObjectId, ref: 'User' },
    sourceModel: { type: String, trim: true },
    sourceId: { type: Schema.Types.ObjectId },
    data: { type: Schema.Types.Mixed },
    readAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, readAt: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });

export const Notification: Model<INotification> = mongoose.model<INotification>(
  'Notification',
  notificationSchema
);
