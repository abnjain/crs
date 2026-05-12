/**
 * ============================================================
 * Alumni Controller - MVC
 * CRUD operations for alumni profiles
 * ============================================================
 */

import { Request, Response, NextFunction } from 'express';
import { Alumni } from '../models/Alumni.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';
import mongoose from 'mongoose';
import { recordAuditEvent } from '../services/audit.service.js';
import type { SelfAlumniUpsertBody } from '../validators/alumni.validator.js';

function getParamId(req: Request): string {
  const raw = req.params.id;
  return Array.isArray(raw) ? (raw[0] ?? '') : (raw ?? '');
}

const POPULATE_USER_FIELDS = 'name email role roles isActive createdAt updatedAt';

export async function getAllAlumni(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    logger.debug('getAllAlumni called');
    const alumni = await Alumni.find().populate('user', POPULATE_USER_FIELDS);
    logger.info(`getAllAlumni: returned ${alumni.length} records`);
    res.json({ success: true, count: alumni.length, alumni });
  } catch (err) {
    next(err);
  }
}

export async function getAlumni(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = getParamId(req);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid ID format', 400);
    }
    const alumni = await Alumni.findById(id).populate('user', POPULATE_USER_FIELDS);
    if (!alumni) {
      throw new AppError('Alumni not found', 404);
    }
    res.json({ success: true, alumni });
  } catch (err) {
    next(err);
  }
}

export async function getAlumniByUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const raw = req.params.userId;
    const userId = Array.isArray(raw) ? (raw[0] ?? '') : (raw ?? '');
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new AppError('Invalid user ID format', 400);
    }
    const alumni = await Alumni.findOne({ user: userId }).populate('user', POPULATE_USER_FIELDS);
    if (!alumni) {
      throw new AppError('Alumni profile not found for this user', 404);
    }
    res.json({ success: true, alumni });
  } catch (err) {
    next(err);
  }
}

export async function createAlumni(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { user, graduationYear, batch, department, company, designation, location, address, linkedIn, phone, bio, isVerified } = req.body;
    logger.debug(`createAlumni: user=${user}, dept=${department}`);

    const existing = await Alumni.findOne({ user });
    if (existing) {
      throw new AppError('Alumni profile already exists for this user', 400);
    }

    const alumni = await Alumni.create({
      user, graduationYear, batch, department, company, designation,
      location, address, linkedIn, phone, bio, isVerified,
    });
    logger.info(`Created alumni profile: ${alumni._id} for user ${user}`);

    recordAuditEvent({
      category: 'alumni',
      action: 'alumni.created',
      req,
      statusCode: 201,
      targetModel: 'Alumni',
      targetId: alumni._id,
      details: {
        user,
        department,
        graduationYear,
        isVerified,
      },
    });

    res.status(201).json({ success: true, alumni });
  } catch (err) {
    next(err);
  }
}

export async function updateAlumni(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = getParamId(req);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid ID format', 400);
    }

    const alumni = await Alumni.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate('user', POPULATE_USER_FIELDS);

    if (!alumni) {
      throw new AppError('Alumni not found', 404);
    }

    logger.info(`Updated alumni profile: ${alumni._id}`);
    recordAuditEvent({
      category: 'alumni',
      action: 'alumni.updated',
      req,
      statusCode: 200,
      targetModel: 'Alumni',
      targetId: alumni._id,
      details: { changes: req.body },
    });
    res.json({ success: true, alumni });
  } catch (err) {
    next(err);
  }
}

export async function deleteAlumni(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = getParamId(req);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid ID format', 400);
    }

    const alumni = await Alumni.findByIdAndDelete(id);
    if (!alumni) {
      throw new AppError('Alumni not found', 404);
    }

    logger.info(`Deleted alumni profile: ${id}`);
    recordAuditEvent({
      category: 'alumni',
      action: 'alumni.deleted',
      req,
      statusCode: 200,
      targetModel: 'Alumni',
      targetId: alumni._id,
      details: { user: alumni.user, department: alumni.department },
    });
    res.json({ success: true, message: 'Alumni profile deleted' });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/alumni/me — alumni: create/update own profile
 */
export async function upsertMyAlumniProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!._id;
    const body = req.body as SelfAlumniUpsertBody;
    const existing = await Alumni.findOne({ user: userId }).exec();

    if (!existing) {
      if (!body.graduationYear || !body.department) {
        throw new AppError('Graduation year and department are required', 400);
      }
      const created = await Alumni.create({
        user: userId,
        graduationYear: body.graduationYear,
        batch: body.batch,
        department: body.department,
        company: body.company,
        designation: body.designation,
        location: body.location,
        address: body.address,
        linkedIn: body.linkedIn,
        phone: body.phone,
        bio: body.bio,
        isVerified: false,
      });

      recordAuditEvent({
        category: 'alumni',
        action: 'alumni.self_created',
        req,
        statusCode: 201,
        targetModel: 'Alumni',
        targetId: created._id,
        details: { user: userId.toString(), department: created.department },
      });

      const populated = await Alumni.findById(created._id).populate('user', POPULATE_USER_FIELDS);
      res.status(201).json({ success: true, alumni: populated });
      return;
    }

    const updates: Record<string, unknown> = { ...body };
    delete updates.isVerified;

    const updated = await Alumni.findByIdAndUpdate(existing._id, updates, {
      new: true,
      runValidators: true,
    }).populate('user', POPULATE_USER_FIELDS);

    if (!updated) {
      throw new AppError('Alumni not found', 404);
    }

    recordAuditEvent({
      category: 'alumni',
      action: 'alumni.self_updated',
      req,
      statusCode: 200,
      targetModel: 'Alumni',
      targetId: updated._id,
      details: { changes: updates },
    });

    res.json({ success: true, alumni: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/alumni/:id/review-queue — admin: approve or reject unverified alumni profile
 */
export async function reviewQueueAlumni(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = getParamId(req);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid ID format', 400);
    }

    const { decision } = req.body as { decision: 'approve' | 'reject' };

    const alumni = await Alumni.findById(id);
    if (!alumni) {
      throw new AppError('Alumni not found', 404);
    }

    if (alumni.isVerified !== false) {
      throw new AppError('This profile is not pending verification', 400);
    }

    if (decision === 'approve') {
      alumni.isVerified = true;
      await alumni.save();
      const populated = await Alumni.findById(alumni._id).populate('user', POPULATE_USER_FIELDS);
      logger.info(`reviewQueueAlumni approve: alumni=${id}`);
      recordAuditEvent({
        category: 'alumni',
        action: 'alumni.verification_approved',
        req,
        statusCode: 200,
        targetModel: 'Alumni',
        targetId: alumni._id,
        details: { user: alumni.user, department: alumni.department },
      });
      res.json({ success: true, alumni: populated });
      return;
    }

    const removed = await Alumni.findOneAndDelete({ _id: id, isVerified: false });
    if (!removed) {
      throw new AppError('Alumni not found or not pending', 404);
    }
    logger.info(`reviewQueueAlumni reject (deleted profile): alumni=${id}`);
    recordAuditEvent({
      category: 'alumni',
      action: 'alumni.verification_rejected',
      req,
      statusCode: 200,
      targetModel: 'Alumni',
      targetId: removed._id,
      details: { user: removed.user, department: removed.department },
    });
    res.json({ success: true, removed: true });
  } catch (err) {
    next(err);
  }
}
