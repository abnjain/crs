/**
 * ============================================================
 * Book Model - Catalog entry
 * ============================================================
 */

import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IBook extends Document {
  isbn: string;
  title: string;
  subtitle?: string;
  authors: string[];
  publisher?: string;
  publishYear?: number;
  edition?: string;
  language?: string;
  categories: string[];
  description?: string;
  coverImage?: string;
  isActive: boolean;
}

const bookSchema = new Schema<IBook>(
  {
    isbn: {
      type: String,
      required: [true, 'ISBN is required'],
      trim: true,
      unique: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    authors: {
      type: [String],
      default: [],
    },
    publisher: {
      type: String,
      trim: true,
    },
    publishYear: {
      type: Number,
    },
    edition: {
      type: String,
      trim: true,
    },
    language: {
      type: String,
      trim: true,
    },
    categories: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      trim: true,
    },
    coverImage: {
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

bookSchema.index({ title: 1 });
bookSchema.index({ authors: 1 });
bookSchema.index({ categories: 1 });

export const Book: Model<IBook> = mongoose.model<IBook>('Book', bookSchema);
