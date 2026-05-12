/**
 * ============================================================
 * Alumni Model - Extended profile for alumni users
 * Links to User model via ObjectId reference
 * ============================================================
 */

import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAlumni extends Document {
  user: mongoose.Types.ObjectId;
  graduationYear: number;
  batch: string;
  department: string;
  company: string;
  designation: string;
  location: string;
  address: string;
  linkedIn: string;
  phone: string;
  bio: string;
  isVerified: boolean;
}

const alumniSchema = new Schema<IAlumni>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
    },
    graduationYear: {
      type: Number,
      required: [true, 'Graduation year is required'],
    },
    batch: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    linkedIn: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

alumniSchema.index({ department: 1, graduationYear: 1 });

export const Alumni: Model<IAlumni> = mongoose.model<IAlumni>('Alumni', alumniSchema);
