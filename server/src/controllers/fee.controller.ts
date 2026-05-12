/**
 * ============================================================
 * Fee Controller - MVC
 * CRUD operations for penalties
 * ============================================================
 */

import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { config } from '../config/index.js';
import { Fee } from '../models/Fee.js';
import { Borrower } from '../models/Borrower.js';
import { Loan } from '../models/Loan.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';
import { recordAuditEvent } from '../services/audit.service.js';
import { createNotification, serializeNotification } from '../services/notification.service.js';
import { emitNotification } from '../services/socket.service.js';

function getParamId(req: Request): string {
  const raw = req.params.id;
  return Array.isArray(raw) ? (raw[0] ?? '') : (raw ?? '');
}

function assertFeeWaiverKey(req: Request): void {
  const configured = config.libraryFeeWaiverKey?.trim();
  const provided = (req.get('x-library-fee-waiver-key') || '').trim();
  if (!configured || provided !== configured) {
    throw new AppError('Not found', 404);
  }
}

export async function getAllFees(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    logger.debug('getAllFees called');
    const fees = await Fee.find()
      .populate('borrower', 'studentId name')
      .populate('loan', 'dueDate status')
      .sort('-createdAt');
    res.json({ success: true, count: fees.length, fees });
  } catch (err) {
    next(err);
  }
}

export async function getFee(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = getParamId(req);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid ID format', 400);
    }
    const fee = await Fee.findById(id)
      .populate('borrower', 'studentId name')
      .populate('loan', 'dueDate status');
    if (!fee) {
      throw new AppError('Fee not found', 404);
    }
    res.json({ success: true, fee });
  } catch (err) {
    next(err);
  }
}

export async function createFee(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { borrowerId, loanId } = req.body as { borrowerId: string; loanId?: string };
    if (!mongoose.Types.ObjectId.isValid(borrowerId)) {
      throw new AppError('Invalid borrower ID format', 400);
    }
    const borrower = await Borrower.findById(borrowerId);
    if (!borrower) {
      throw new AppError('Borrower not found', 404);
    }
    if (loanId) {
      if (!mongoose.Types.ObjectId.isValid(loanId)) {
        throw new AppError('Invalid loan ID format', 400);
      }
      const loan = await Loan.findById(loanId);
      if (!loan) {
        throw new AppError('Loan not found', 404);
      }
    }

    const fee = await Fee.create({
      ...req.body,
      borrower: borrowerId,
      loan: loanId,
      status: req.body.status ?? 'applied',
    });

    recordAuditEvent({
      category: 'library',
      action: 'fee.created',
      req,
      statusCode: 201,
      targetModel: 'Fee',
      targetId: fee._id,
      details: { borrower: borrowerId, loan: loanId, amount: fee.amount },
    });

    if (borrower.email) {
      const borrowerUser = await User.findOne({ email: borrower.email.toLowerCase() }).select('_id name').exec();
      if (borrowerUser) {
        const notif = await createNotification({
          userId: borrowerUser._id,
          title: 'Library fee applied',
          message: `A fee of ${fee.amount} has been applied to your library account.`,
          type: 'fee',
          link: '/dashboard',
          actorId: req.user?._id,
          sourceModel: 'Fee',
          sourceId: fee._id,
          data: { feeId: fee._id.toString(), amount: fee.amount },
        });
        emitNotification(borrowerUser._id.toString(), serializeNotification(notif));
      }
    }

    res.status(201).json({ success: true, fee });
  } catch (err) {
    next(err);
  }
}

export async function updateFee(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = getParamId(req);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid ID format', 400);
    }

    if (req.body?.status === 'waived') {
      throw new AppError('Fee waiver must use the waiver endpoint', 400);
    }

    const fee = await Fee.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!fee) {
      throw new AppError('Fee not found', 404);
    }

    recordAuditEvent({
      category: 'library',
      action: 'fee.updated',
      req,
      statusCode: 200,
      targetModel: 'Fee',
      targetId: fee._id,
      details: { changes: req.body },
    });

    res.json({ success: true, fee });
  } catch (err) {
    next(err);
  }
}

export async function waiveFee(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertFeeWaiverKey(req);

    const id = getParamId(req);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid ID format', 400);
    }

    const fee = await Fee.findById(id);
    if (!fee) {
      throw new AppError('Fee not found', 404);
    }
    if (fee.status !== 'applied') {
      throw new AppError('Only applied fees can be waived', 400);
    }

    fee.status = 'waived';
    fee.waivedAt = new Date();
    fee.waivedBy = req.user?._id;
    fee.waiverReason = req.body?.reason;
    await fee.save();

    recordAuditEvent({
      category: 'library',
      action: 'fee.waived',
      req,
      statusCode: 200,
      targetModel: 'Fee',
      targetId: fee._id,
      details: { amount: fee.amount, reason: fee.waiverReason },
    });

    res.json({ success: true, fee });
  } catch (err) {
    next(err);
  }
}

export async function deleteFee(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = getParamId(req);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid ID format', 400);
    }

    const fee = await Fee.findByIdAndDelete(id);
    if (!fee) {
      throw new AppError('Fee not found', 404);
    }

    recordAuditEvent({
      category: 'library',
      action: 'fee.deleted',
      req,
      statusCode: 200,
      targetModel: 'Fee',
      targetId: fee._id,
      details: { amount: fee.amount, status: fee.status },
    });

    res.json({ success: true, message: 'Fee deleted' });
  } catch (err) {
    next(err);
  }
}
