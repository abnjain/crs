/**
 * ============================================================
 * BookCopy Model - Physical inventory
 * ============================================================
 */

import mongoose, { Document, Model, Schema } from 'mongoose';

export type BookCopyStatus = 'available' | 'loaned' | 'lost' | 'maintenance';
export type BookCopyCondition = 'new' | 'good' | 'fair' | 'poor';

export interface IBookCopy extends Document {
  book: mongoose.Types.ObjectId;
  barcode?: string;
  status: BookCopyStatus;
  condition: BookCopyCondition;
  shelfLocation?: string;
  notes?: string;
  acquiredAt?: Date;
  lastLoanedAt?: Date;
  isActive: boolean;
}

const bookCopySchema = new Schema<IBookCopy>(
  {
    book: {
      type: Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book reference is required'],
    },
    barcode: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    status: {
      type: String,
      enum: ['available', 'loaned', 'lost', 'maintenance'],
      default: 'available',
    },
    condition: {
      type: String,
      enum: ['new', 'good', 'fair', 'poor'],
      default: 'good',
    },
    shelfLocation: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    acquiredAt: {
      type: Date,
    },
    lastLoanedAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

bookCopySchema.index({ book: 1, status: 1 });

export const BookCopy: Model<IBookCopy> = mongoose.model<IBookCopy>('BookCopy', bookCopySchema);
