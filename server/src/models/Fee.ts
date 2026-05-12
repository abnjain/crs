/**
 * ============================================================
 * Fee Model - Penalties and adjustments
 * ============================================================
 */

import mongoose, { Document, Model, Schema } from 'mongoose';

export type FeeStatus = 'applied' | 'waived' | 'paid';

export interface IFee extends Document {
  borrower: mongoose.Types.ObjectId;
  loan?: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  reason: string;
  status: FeeStatus;
  appliedAt: Date;
  waivedAt?: Date;
  waivedBy?: mongoose.Types.ObjectId;
  waiverReason?: string;
  paidAt?: Date;
}

const feeSchema = new Schema<IFee>(
  {
    borrower: {
      type: Schema.Types.ObjectId,
      ref: 'Borrower',
      required: [true, 'Borrower is required'],
    },
    loan: {
      type: Schema.Types.ObjectId,
      ref: 'Loan',
    },
    amount: {
      type: Number,
      required: [true, 'Fee amount is required'],
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true,
    },
    reason: {
      type: String,
      required: [true, 'Fee reason is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['applied', 'waived', 'paid'],
      default: 'applied',
    },
    appliedAt: {
      type: Date,
      default: () => new Date(),
    },
    waivedAt: {
      type: Date,
    },
    waivedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    waiverReason: {
      type: String,
      trim: true,
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

feeSchema.index({ borrower: 1, status: 1 });
feeSchema.index({ loan: 1, status: 1 });

export const Fee: Model<IFee> = mongoose.model<IFee>('Fee', feeSchema);
