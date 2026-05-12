/**
 * ============================================================
 * Borrower Model - Internal student registry snapshot
 * ============================================================
 */

import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IBorrower extends Document {
  studentId: string;
  name: string;
  email?: string;
  department?: string;
  program?: string;
  batch?: string;
  phone?: string;
  externalRef?: string;
  notes?: string;
  isActive: boolean;
}

const borrowerSchema = new Schema<IBorrower>(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      trim: true,
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    program: {
      type: String,
      trim: true,
    },
    batch: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    externalRef: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
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

borrowerSchema.index({ name: 1 });

export const Borrower: Model<IBorrower> = mongoose.model<IBorrower>('Borrower', borrowerSchema);
