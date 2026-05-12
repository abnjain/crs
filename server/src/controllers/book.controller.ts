/**
 * ============================================================
 * Book Controller - MVC
 * CRUD operations for catalog entries
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

export async function getAllBooks(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    logger.debug('getAllBooks called');
    const books = await Book.find().sort('title');
    res.json({ success: true, count: books.length, books });
  } catch (err) {
    next(err);
  }
}

export async function getBook(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = getParamId(req);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid ID format', 400);
    }
    const book = await Book.findById(id);
    if (!book) {
      throw new AppError('Book not found', 404);
    }
    res.json({ success: true, book });
  } catch (err) {
    next(err);
  }
}

export async function getBookByIsbn(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const raw = req.params.isbn;
    const isbn = Array.isArray(raw) ? (raw[0] ?? '') : (raw ?? '');
    const book = await Book.findOne({ isbn: isbn.trim() });
    if (!book) {
      throw new AppError('Book not found', 404);
    }
    res.json({ success: true, book });
  } catch (err) {
    next(err);
  }
}

export async function createBook(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { isbn } = req.body as { isbn: string };
    const existing = await Book.findOne({ isbn: isbn.trim() });
    if (existing) {
      throw new AppError('Book with this ISBN already exists', 400);
    }

    const book = await Book.create(req.body);
    recordAuditEvent({
      category: 'library',
      action: 'book.created',
      req,
      statusCode: 201,
      targetModel: 'Book',
      targetId: book._id,
      details: { isbn: book.isbn, title: book.title },
    });
    res.status(201).json({ success: true, book });
  } catch (err) {
    next(err);
  }
}

export async function updateBook(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = getParamId(req);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid ID format', 400);
    }

    const book = await Book.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!book) {
      throw new AppError('Book not found', 404);
    }

    recordAuditEvent({
      category: 'library',
      action: 'book.updated',
      req,
      statusCode: 200,
      targetModel: 'Book',
      targetId: book._id,
      details: { changes: req.body },
    });
    res.json({ success: true, book });
  } catch (err) {
    next(err);
  }
}

export async function deleteBook(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = getParamId(req);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid ID format', 400);
    }

    const copyCount = await BookCopy.countDocuments({ book: id });
    if (copyCount > 0) {
      throw new AppError('Cannot delete book with existing copies', 400);
    }

    const book = await Book.findByIdAndDelete(id);
    if (!book) {
      throw new AppError('Book not found', 404);
    }

    recordAuditEvent({
      category: 'library',
      action: 'book.deleted',
      req,
      statusCode: 200,
      targetModel: 'Book',
      targetId: book._id,
      details: { isbn: book.isbn, title: book.title },
    });
    res.json({ success: true, message: 'Book deleted' });
  } catch (err) {
    next(err);
  }
}
