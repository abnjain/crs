/**
 * ============================================================
 * Message Model - Conversation messages with soft delete & read receipts
 * ============================================================
 */

import mongoose, { Document, Model, Schema } from 'mongoose';

export type MessageContentType = 'text' | 'system';

export interface IMessage extends Document {
  conversation: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  type: MessageContentType;
  readBy: mongoose.Types.ObjectId[];
  isDeleted: boolean;
  deletedAt?: Date;
  // list of users who have deleted this message for themselves
  deletedFor: mongoose.Types.ObjectId[];
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 8000,
      trim: true,
    },
    type: {
      type: String,
      enum: ['text', 'system'],
      default: 'text',
    },
    readBy: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    // per-user deletion: users who chose to delete this message for themselves
    deletedFor: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      default: [],
      index: true,
    },
    deletedAt: {
      type: Date,
    },
    editedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

export const Message: Model<IMessage> = mongoose.model<IMessage>('Message', messageSchema);
