/**
 * ============================================================
 * Loan Model - Book lending lifecycle
 * ============================================================
 */

import mongoose, { Document, Model, Schema } from 'mongoose';

export type LoanStatus = 'active' | 'overdue' | 'returned' | 'lost';

export interface ILoan extends Document {
  borrower: mongoose.Types.ObjectId;
  book: mongoose.Types.ObjectId;
  copy: mongoose.Types.ObjectId;
  issuedBy?: mongoose.Types.ObjectId;
  loanDate: Date;
  dueDate: Date;
  returnedAt?: Date;
  status: LoanStatus;
  renewalsCount: number;
  maxRenewals: number;
  penaltyAccrued: number;
}

const loanSchema = new Schema<ILoan>(
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
    copy: {
      type: Schema.Types.ObjectId,
      ref: 'BookCopy',
      required: [true, 'Book copy is required'],
    },
    issuedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    loanDate: {
      type: Date,
      default: () => new Date(),
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    returnedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'overdue', 'returned', 'lost'],
      default: 'active',
    },
    renewalsCount: {
      type: Number,
      default: 0,
    },
    maxRenewals: {
      type: Number,
      default: 1,
    },
    penaltyAccrued: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

loanSchema.index({ borrower: 1, status: 1 });
loanSchema.index({ copy: 1, status: 1 });
loanSchema.index({ dueDate: 1, status: 1 });

export const Loan: Model<ILoan> = mongoose.model<ILoan>('Loan', loanSchema);
