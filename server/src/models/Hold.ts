/**
 * ============================================================
 * Hold Model - Reservation queue
 * ============================================================
 */

import mongoose, { Document, Model, Schema } from 'mongoose';

export type HoldStatus = 'active' | 'fulfilled' | 'canceled' | 'expired';

export interface IHold extends Document {
  borrower: mongoose.Types.ObjectId;
  book: mongoose.Types.ObjectId;
  status: HoldStatus;
  placedAt: Date;
  expiresAt?: Date;
  fulfilledLoan?: mongoose.Types.ObjectId;
  notes?: string;
}

const holdSchema = new Schema<IHold>(
  {
    borrower: {
      type: Schema.Types.ObjectId,
      ref: 'Borrower',
      required: [true, 'Borrower is required'],
    },
    book: {
      type: Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book is required'],
    },
    status: {
      type: String,
      enum: ['active', 'fulfilled', 'canceled', 'expired'],
      default: 'active',
    },
    placedAt: {
      type: Date,
      default: () => new Date(),
    },
    expiresAt: {
      type: Date,
    },
    fulfilledLoan: {
      type: Schema.Types.ObjectId,
      ref: 'Loan',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

holdSchema.index({ borrower: 1, status: 1 });
holdSchema.index({ book: 1, status: 1 });

export const Hold: Model<IHold> = mongoose.model<IHold>('Hold', holdSchema);
