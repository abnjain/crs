/**
 * ============================================================
 * Borrower Controller - MVC
 * CRUD operations for borrowers
 * ============================================================
 */

import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Borrower } from '../models/Borrower.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';
import { recordAuditEvent } from '../services/audit.service.js';

function getParamId(req: Request): string {
  const raw = req.params.id;
  return Array.isArray(raw) ? (raw[0] ?? '') : (raw ?? '');
}

export async function getAllBorrowers(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    logger.debug('getAllBorrowers called');
    const borrowers = await Borrower.find().sort('name');
    res.json({ success: true, count: borrowers.length, borrowers });
  } catch (err) {
    next(err);
  }
}

export async function getBorrower(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = getParamId(req);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid ID format', 400);
    }
    const borrower = await Borrower.findById(id);
    if (!borrower) {
      throw new AppError('Borrower not found', 404);
    }
    res.json({ success: true, borrower });
  } catch (err) {
    next(err);
  }
}

export async function getBorrowerByStudentId(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const raw = req.params.studentId;
    const studentId = Array.isArray(raw) ? (raw[0] ?? '') : (raw ?? '');
    const borrower = await Borrower.findOne({ studentId: studentId.trim() });
    if (!borrower) {
      throw new AppError('Borrower not found', 404);
    }
    res.json({ success: true, borrower });
  } catch (err) {
    next(err);
  }
}

export async function createBorrower(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { studentId } = req.body as { studentId: string };
    const existing = await Borrower.findOne({ studentId: studentId.trim() });
    if (existing) {
      throw new AppError('Borrower with this student ID already exists', 400);
    }

    const borrower = await Borrower.create(req.body);
    recordAuditEvent({
      category: 'library',
      action: 'borrower.created',
      req,
      statusCode: 201,
      targetModel: 'Borrower',
      targetId: borrower._id,
      details: { studentId: borrower.studentId, name: borrower.name },
    });
    res.status(201).json({ success: true, borrower });
  } catch (err) {
    next(err);
  }
}

export async function updateBorrower(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = getParamId(req);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid ID format', 400);
    }

    const borrower = await Borrower.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!borrower) {
      throw new AppError('Borrower not found', 404);
    }

    recordAuditEvent({
      category: 'library',
      action: 'borrower.updated',
      req,
      statusCode: 200,
      targetModel: 'Borrower',
      targetId: borrower._id,
      details: { changes: req.body },
    });
    res.json({ success: true, borrower });
  } catch (err) {
    next(err);
  }
}

export async function deleteBorrower(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = getParamId(req);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid ID format', 400);
    }

    const borrower = await Borrower.findByIdAndDelete(id);
    if (!borrower) {
      throw new AppError('Borrower not found', 404);
    }

    recordAuditEvent({
      category: 'library',
      action: 'borrower.deleted',
      req,
      statusCode: 200,
      targetModel: 'Borrower',
      targetId: borrower._id,
      details: { studentId: borrower.studentId, name: borrower.name },
    });
    res.json({ success: true, message: 'Borrower deleted' });
  } catch (err) {
    next(err);
  }
}
