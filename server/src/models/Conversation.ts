/**
 * ============================================================
 * Conversation Model - Direct and broadcast threads (1:1 with admin copy)
 * ============================================================
 */

import mongoose, { Document, Model, Schema } from 'mongoose';

export type ConversationType = 'direct' | 'broadcast';

export interface IConversationMetadata {
  broadcastTitle?: string;
  broadcastRecipientCount?: number;
}

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  type: ConversationType;
  createdBy: mongoose.Types.ObjectId;
  lastMessage: mongoose.Types.ObjectId | null;
  lastMessageAt: Date;
  archivedBy: mongoose.Types.ObjectId[];
  metadata: IConversationMetadata;
  /** Sorted pair key `idA:idB` for unique direct conversations */
  participantPairKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      validate: {
        validator(v: mongoose.Types.ObjectId[]) {
          return Array.isArray(v) && v.length === 2;
        },
        message: 'Conversation must have exactly two participants',
      },
    },
    type: {
      type: String,
      enum: ['direct', 'broadcast'],
      default: 'direct',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    archivedBy: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
    metadata: {
      broadcastTitle: { type: String, trim: true },
      broadcastRecipientCount: { type: Number },
    },
    participantPairKey: {
      type: String,
      sparse: true,
      unique: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });
conversationSchema.index({ type: 1, createdBy: 1 });

conversationSchema.pre('save', async function preSaveConversation() {
  if (this.participants?.length === 2 && this.type === 'direct') {
    const [a, b] = [...this.participants.map((p) => p.toString())].sort();
    this.participantPairKey = `${a}:${b}`;
  } else {
    this.participantPairKey = undefined;
  }
});

export const Conversation: Model<IConversation> = mongoose.model<IConversation>(
  'Conversation',
  conversationSchema
);
