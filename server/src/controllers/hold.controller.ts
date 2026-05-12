/**
 * ============================================================
 * Hold Controller - MVC
 * CRUD operations for holds
 * ============================================================
 */

import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Hold } from '../models/Hold.js';
import { Borrower } from '../models/Borrower.js';
import { Book } from '../models/Book.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';
import { recordAuditEvent } from '../services/audit.service.js';

function getParamId(req: Request): string {
  const raw = req.params.id;
  return Array.isArray(raw) ? (raw[0] ?? '') : (raw ?? '');
}

export async function getAllHolds(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    logger.debug('getAllHolds called');
    const holds = await Hold.find()
      .populate('borrower', 'studentId name')
      .populate('book', 'title isbn')
      .sort('-createdAt');
    res.json({ success: true, count: holds.length, holds });
  } catch (err) {
    next(err);
  }
}

export async function getHold(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = getParamId(req);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid ID format', 400);
    }
    const hold = await Hold.findById(id)
      .populate('borrower', 'studentId name')
      .populate('book', 'title isbn');
    if (!hold) {
      throw new AppError('Hold not found', 404);
    }
    res.json({ success: true, hold });
  } catch (err) {
    next(err);
  }
}

export async function createHold(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { borrowerId, bookId } = req.body as { borrowerId: string; bookId: string };
    if (!mongoose.Types.ObjectId.isValid(borrowerId)) {
      throw new AppError('Invalid borrower ID format', 400);
    }
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      throw new AppError('Invalid book ID format', 400);
    }

    const borrower = await Borrower.findById(borrowerId);
    if (!borrower || !borrower.isActive) {
      throw new AppError('Borrower not found or inactive', 404);
    }
    const book = await Book.findById(bookId);
    if (!book) {
      throw new AppError('Book not found', 404);
    }

    const existing = await Hold.findOne({
      borrower: borrowerId,
      book: bookId,
      status: 'active',
    });
    if (existing) {
      throw new AppError('Active hold already exists for this borrower and book', 400);
    }

    const hold = await Hold.create({
      ...req.body,
      borrower: borrowerId,
      book: bookId,
    });

    recordAuditEvent({
      category: 'library',
      action: 'hold.created',
      req,
      statusCode: 201,
      targetModel: 'Hold',
      targetId: hold._id,
      details: { borrower: borrowerId, book: bookId },
    });

    res.status(201).json({ success: true, hold });
  } catch (err) {
    next(err);
  }
}

export async function updateHold(
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
    if (update.borrowerId) {
      const borrowerId = String(update.borrowerId);
      if (!mongoose.Types.ObjectId.isValid(borrowerId)) {
        throw new AppError('Invalid borrower ID format', 400);
      }
      update.borrower = borrowerId;
      delete update.borrowerId;
    }
    if (update.bookId) {
      const bookId = String(update.bookId);
      if (!mongoose.Types.ObjectId.isValid(bookId)) {
        throw new AppError('Invalid book ID format', 400);
      }
      update.book = bookId;
      delete update.bookId;
    }

    const hold = await Hold.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    })
      .populate('borrower', 'studentId name')
      .populate('book', 'title isbn');

    if (!hold) {
      throw new AppError('Hold not found', 404);
    }

    recordAuditEvent({
      category: 'library',
      action: 'hold.updated',
      req,
      statusCode: 200,
      targetModel: 'Hold',
      targetId: hold._id,
      details: { changes: req.body },
    });

    res.json({ success: true, hold });
  } catch (err) {
    next(err);
  }
}

export async function deleteHold(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = getParamId(req);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid ID format', 400);
    }

    const hold = await Hold.findByIdAndDelete(id);
    if (!hold) {
      throw new AppError('Hold not found', 404);
    }

    recordAuditEvent({
      category: 'library',
      action: 'hold.deleted',
      req,
      statusCode: 200,
      targetModel: 'Hold',
      targetId: hold._id,
      details: { borrower: hold.borrower, book: hold.book, status: hold.status },
    });

    res.json({ success: true, message: 'Hold deleted' });
  } catch (err) {
    next(err);
  }
}
