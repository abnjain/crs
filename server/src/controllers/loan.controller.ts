/**
 * ============================================================
 * Loan Controller - MVC
 * Lending, returns, renewals
 * ============================================================
 */

import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Loan } from '../models/Loan.js';
import { Book } from '../models/Book.js';
import { BookCopy, type IBookCopy } from '../models/BookCopy.js';
import { Borrower } from '../models/Borrower.js';
import { Fee } from '../models/Fee.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';
import { recordAuditEvent } from '../services/audit.service.js';

const MAX_ACTIVE_LOANS = 5;
const LOAN_DAYS = 60;
const FEE_PER_DAY = 5;
const FEE_CAP = 5000;

function getParamId(req: Request): string {
  const raw = req.params.id;
  return Array.isArray(raw) ? (raw[0] ?? '') : (raw ?? '');
}

function addDays(base: Date, days: number): Date {
  const date = new Date(base);
  date.setDate(date.getDate() + days);
  return date;
}

function calculateOverdueDays(dueDate: Date, returnedAt: Date): number {
  const diffMs = returnedAt.getTime() - dueDate.getTime();
  if (diffMs <= 0) return 0;
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil(diffMs / msPerDay);
}

export async function getAllLoans(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    logger.debug('getAllLoans called');
    const loans = await Loan.find()
      .populate('borrower', 'studentId name')
      .populate('book', 'title isbn')
      .populate('copy', 'barcode status')
      .sort('-createdAt');
    res.json({ success: true, count: loans.length, loans });
  } catch (err) {
    next(err);
  }
}

export async function getLoan(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = getParamId(req);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid ID format', 400);
    }
    const loan = await Loan.findById(id)
      .populate('borrower', 'studentId name')
      .populate('book', 'title isbn')
      .populate('copy', 'barcode status');
    if (!loan) {
      throw new AppError('Loan not found', 404);
    }
    res.json({ success: true, loan });
  } catch (err) {
    next(err);
  }
}

export async function createLoan(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { borrowerId, copyId, isbn } = req.body as {
      borrowerId: string;
      copyId?: string;
      isbn?: string;
    };

    if (!mongoose.Types.ObjectId.isValid(borrowerId)) {
      throw new AppError('Invalid borrower ID format', 400);
    }

    const borrower = await Borrower.findById(borrowerId);
    if (!borrower || !borrower.isActive) {
      throw new AppError('Borrower not found or inactive', 404);
    }

    const activeCount = await Loan.countDocuments({
      borrower: borrowerId,
      status: { $in: ['active', 'overdue'] },
    });
    if (activeCount >= MAX_ACTIVE_LOANS) {
      throw new AppError('Borrower has reached the maximum active loan limit', 400);
    }

    let copy: IBookCopy | null = null;
    let bookId: string | null = null;

    if (copyId) {
      if (!mongoose.Types.ObjectId.isValid(copyId)) {
        throw new AppError('Invalid copy ID format', 400);
      }
      copy = await BookCopy.findById(copyId);
      if (!copy) {
        throw new AppError('Book copy not found', 404);
      }
      if (!copy.isActive || copy.status !== 'available') {
        throw new AppError('Book copy is not available', 400);
      }
      bookId = String(copy.book);
    } else if (isbn) {
      const book = await Book.findOne({ isbn: isbn.trim() });
      if (!book) {
        throw new AppError('Book not found for this ISBN', 404);
      }
      bookId = String(book._id);
      copy = await BookCopy.findOne({ book: book._id, status: 'available', isActive: true }).sort(
        'createdAt'
      );
      if (!copy) {
        throw new AppError('No available copy for this book', 400);
      }
    }

    if (!copy || !bookId) {
      throw new AppError('Book copy could not be resolved', 400);
    }

    const dueDate = addDays(new Date(), LOAN_DAYS);
    const loan = await Loan.create({
      borrower: borrowerId,
      book: bookId,
      copy: copy._id,
      issuedBy: req.user?._id,
      dueDate,
      status: 'active',
    });

    await BookCopy.findByIdAndUpdate(copy._id, {
      status: 'loaned',
      lastLoanedAt: new Date(),
    });

    recordAuditEvent({
      category: 'library',
      action: 'loan.created',
      req,
      statusCode: 201,
      targetModel: 'Loan',
      targetId: loan._id,
      details: {
        borrower: borrowerId,
        book: bookId,
        copy: copy._id,
        dueDate,
      },
    });

    res.status(201).json({ success: true, loan });
  } catch (err) {
    next(err);
  }
}

export async function renewLoan(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = getParamId(req);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid ID format', 400);
    }

    const loan = await Loan.findById(id);
    if (!loan) {
      throw new AppError('Loan not found', 404);
    }
    if (loan.status !== 'active') {
      throw new AppError('Only active loans can be renewed', 400);
    }
    if (loan.dueDate.getTime() < Date.now()) {
      throw new AppError('Overdue loans cannot be renewed', 400);
    }
    if (loan.renewalsCount >= loan.maxRenewals) {
      throw new AppError('Loan renewal limit reached', 400);
    }

    loan.dueDate = addDays(loan.dueDate, LOAN_DAYS);
    loan.renewalsCount += 1;
    await loan.save();

    recordAuditEvent({
      category: 'library',
      action: 'loan.renewed',
      req,
      statusCode: 200,
      targetModel: 'Loan',
      targetId: loan._id,
      details: { dueDate: loan.dueDate, renewalsCount: loan.renewalsCount },
    });

    res.json({ success: true, loan });
  } catch (err) {
    next(err);
  }
}

export async function returnLoan(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = getParamId(req);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid ID format', 400);
    }

    const loan = await Loan.findById(id);
    if (!loan) {
      throw new AppError('Loan not found', 404);
    }
    if (loan.status === 'returned') {
      throw new AppError('Loan already returned', 400);
    }

    const returnedAt = req.body?.returnedAt ? new Date(req.body.returnedAt) : new Date();
    const overdueDays = calculateOverdueDays(loan.dueDate, returnedAt);
    const penalty = Math.min(overdueDays * FEE_PER_DAY, FEE_CAP);

    loan.returnedAt = returnedAt;
    loan.status = 'returned';
    loan.penaltyAccrued = penalty;
    await loan.save();

    await BookCopy.findByIdAndUpdate(loan.copy, { status: 'available' });

    if (penalty > 0) {
      const existing = await Fee.findOne({ loan: loan._id, status: { $ne: 'waived' } });
      if (!existing) {
        await Fee.create({
          borrower: loan.borrower,
          loan: loan._id,
          amount: penalty,
          currency: 'INR',
          reason: `Overdue return (${overdueDays} days)`,
          status: 'applied',
        });
      }
    }

    recordAuditEvent({
      category: 'library',
      action: 'loan.returned',
      req,
      statusCode: 200,
      targetModel: 'Loan',
      targetId: loan._id,
      details: { overdueDays, penalty },
    });

    res.json({ success: true, loan, penalty });
  } catch (err) {
    next(err);
  }
}

export async function deleteLoan(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = getParamId(req);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid ID format', 400);
    }

    const loan = await Loan.findById(id);
    if (!loan) {
      throw new AppError('Loan not found', 404);
    }
    if (loan.status === 'active' || loan.status === 'overdue') {
      throw new AppError('Active loans cannot be deleted', 400);
    }

    await loan.deleteOne();

    recordAuditEvent({
      category: 'library',
      action: 'loan.deleted',
      req,
      statusCode: 200,
      targetModel: 'Loan',
      targetId: loan._id,
      details: { borrower: loan.borrower, book: loan.book, copy: loan.copy },
    });

    res.json({ success: true, message: 'Loan deleted' });
  } catch (err) {
    next(err);
  }
}
