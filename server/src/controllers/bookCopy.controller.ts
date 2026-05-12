/**
 * ============================================================
 * BookCopy Controller - MVC
 * CRUD operations for inventory copies
 * ============================================================
 */

import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Book } from '../models/Book.js';
import { BookCopy } from '../models/BookCopy.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';
import { recordAuditEvent } from '../services/audit.service.js';

function getParamId(req: Request): string {
  const raw = req.params.id;
  return Array.isArray(raw) ? (raw[0] ?? '') : (raw ?? '');
}

export async function getAllBookCopies(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    logger.debug('getAllBookCopies called');
    const copies = await BookCopy.find().populate('book', 'title isbn');
    res.json({ success: true, count: copies.length, copies });
  } catch (err) {
    next(err);
  }
}

export async function getBookCopy(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = getParamId(req);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid ID format', 400);
    }
    const copy = await BookCopy.findById(id).populate('book', 'title isbn');
    if (!copy) {
      throw new AppError('Book copy not found', 404);
    }
    res.json({ success: true, copy });
  } catch (err) {
    next(err);
  }
}

export async function createBookCopy(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { bookId, barcode } = req.body as { bookId: string; barcode?: string };
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      throw new AppError('Invalid book ID format', 400);
    }
    const book = await Book.findById(bookId);
    if (!book) {
      throw new AppError('Book not found', 404);
    }
    if (barcode) {
      const existing = await BookCopy.findOne({ barcode: barcode.trim() });
      if (existing) {
        throw new AppError('Book copy with this barcode already exists', 400);
      }
    }

    const copy = await BookCopy.create({
      ...req.body,
      book: bookId,
    });

    recordAuditEvent({
      category: 'library',
      action: 'bookCopy.created',
      req,
      statusCode: 201,
      targetModel: 'BookCopy',
      targetId: copy._id,
      details: { book: bookId, barcode: copy.barcode, status: copy.status },
    });

    res.status(201).json({ success: true, copy });
  } catch (err) {
    next(err);
  }
}

export async function updateBookCopy(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = getParamId(req);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid ID format', 400);
    }

    const update: Record<string, unknown> = { ...req.body };
    if (update.bookId) {
      const bookId = String(update.bookId);
      if (!mongoose.Types.ObjectId.isValid(bookId)) {
        throw new AppError('Invalid book ID format', 400);
      }
      const book = await Book.findById(bookId);
      if (!book) {
        throw new AppError('Book not found', 404);
      }
      update.book = bookId;
      delete update.bookId;
    }

    if (update.barcode) {
      const existing = await BookCopy.findOne({
        barcode: String(update.barcode).trim(),
        _id: { $ne: id },
      });
      if (existing) {
        throw new AppError('Book copy with this barcode already exists', 400);
      }
    }

    const copy = await BookCopy.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).populate('book', 'title isbn');

    if (!copy) {
      throw new AppError('Book copy not found', 404);
    }

    recordAuditEvent({
      category: 'library',
      action: 'bookCopy.updated',
      req,
      statusCode: 200,
      targetModel: 'BookCopy',
      targetId: copy._id,
      details: { changes: req.body },
    });

    res.json({ success: true, copy });
  } catch (err) {
    next(err);
  }
}

export async function deleteBookCopy(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = getParamId(req);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid ID format', 400);
    }

    const copy = await BookCopy.findById(id);
    if (!copy) {
      throw new AppError('Book copy not found', 404);
    }
    if (copy.status === 'loaned') {
      throw new AppError('Cannot delete a loaned copy', 400);
    }

    await copy.deleteOne();

    recordAuditEvent({
      category: 'library',
      action: 'bookCopy.deleted',
      req,
      statusCode: 200,
      targetModel: 'BookCopy',
      targetId: copy._id,
      details: { book: copy.book, barcode: copy.barcode, status: copy.status },
    });

    res.json({ success: true, message: 'Book copy deleted' });
  } catch (err) {
    next(err);
  }
}
