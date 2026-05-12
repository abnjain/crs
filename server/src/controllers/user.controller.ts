/**
 * ============================================================
 * User Controller - MVC
 * GET /api/v1/users (admin only)
 * GET /api/v1/users/:id
 * ============================================================
 */

import { Request, Response, NextFunction } from 'express';
import { User, getPrimaryRole, type IUser } from '../models/User.js';
import { Alumni } from '../models/Alumni.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';
import mongoose from 'mongoose';
import { recordAuditEvent } from '../services/audit.service.js';
import { createNotification, serializeNotification } from '../services/notification.service.js';
import { emitNotification } from '../services/socket.service.js';

/**
 * Get all users - Admin only (RBAC applied in route)
 */
export async function getAllUsers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    logger.debug('getAllUsers called (admin)');
    const docs = await User.find().select('-password');
    const baseUsers = docs.map((d) =>
      typeof d.toJSON === 'function' ? d.toJSON() : (d as unknown as Record<string, unknown>)
    ) as Record<string, unknown>[];

    const ids = docs.map((d) => d._id);
    const alumniRows = await Alumni.find({ user: { $in: ids } })
      .select('user department graduationYear isVerified')
      .lean();

    const alumByUser = new Map<
      string,
      { alumniDepartment: string; alumniGraduationYear: number; alumniProfileVerified: boolean }
    >();
    for (const a of alumniRows as {
      user: mongoose.Types.ObjectId;
      department?: string;
      graduationYear?: number;
      isVerified?: boolean;
    }[]) {
      alumByUser.set(String(a.user), {
        alumniDepartment: String(a.department ?? ''),
        alumniGraduationYear: Number(a.graduationYear),
        alumniProfileVerified: Boolean(a.isVerified),
      });
    }

    const users = baseUsers.map((u) => {
      const alum = alumByUser.get(String(u._id));
      if (!alum) return u;
      return { ...u, ...alum };
    });

    logger.info(`getAllUsers: returned ${users.length} users`);
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    next(err);
  }
}

/**
 * Get single user by ID
 */
export async function getUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    logger.debug(`getUser: id=${req.params.id}`);
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      throw new AppError('User not found', 404);
    }
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new user (admin only)
 * POST /api/v1/users
 */
export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, email, password, role, roles } = req.body;
    const dbName = mongoose.connection.db?.databaseName ?? 'unknown';
    logger.debug(`Admin createUser: email=${email}, role=${role}, roles=${roles}, db=${dbName}`);

    const existing = await User.findOne({ email });
    if (existing) {
      throw new AppError('User with this email already exists', 400);
    }

    const createPayload = roles?.length
      ? { name, email, password, roles, isVerified: true }
      : { name, email, password, role: role || 'alumni', isVerified: true };
    const user = await User.create(createPayload);
    logger.info(`Admin created user: ${user.email} (roles: [${user.getEffectiveRoles().join(', ')}])`);

    const effectiveRoles = user.getEffectiveRoles();
    recordAuditEvent({
      category: 'user',
      action: 'user.created',
      req,
      statusCode: 201,
      targetModel: 'User',
      targetId: user._id,
      details: {
        name: user.name,
        email: user.email,
        roles: effectiveRoles,
      },
    });
    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: getPrimaryRole(effectiveRoles),
        roles: effectiveRoles,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function searchUsers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const q = String(req.query.q ?? '').trim();
    if (!q || q.length < 2) {
      res.json({ success: true, users: [] });
      return;
    }
    const currentUserId = req.user!._id;
    const users = await User.find({
      _id: { $ne: currentUserId },
      isActive: true,
      name: { $regex: q, $options: 'i' },
    })
      .select('_id name email')
      .limit(20)
      .lean()
      .exec();
    res.json({
      success: true,
      users: users.map((u) => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
      })),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/users/:id/active — admin: set account active (approve) / inactive (reject sign-in)
 */
export async function patchUserActive(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? (req.params.id[0] ?? '') : (req.params.id ?? '');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid ID format', 400);
    }

    const { isActive } = req.body as { isActive: boolean };
    const actor = req.user as IUser;

    if (String(actor._id) === id && isActive === false) {
      throw new AppError('You cannot deactivate your own account', 400);
    }

    const target = await User.findById(id);
    if (!target) {
      throw new AppError('User not found', 404);
    }

    const effective = target.getEffectiveRoles();
    if (!isActive && effective.includes('superadmin')) {
      throw new AppError('Cannot deactivate a superadmin account', 403);
    }

    const updated = await User.findByIdAndUpdate(id, { isActive }, { new: true, runValidators: true }).select(
      '-password'
    );

    if (!updated) {
      throw new AppError('User not found', 404);
    }

    const rolesOut = updated.getEffectiveRoles();
    logger.info(`patchUserActive: user=${id} isActive=${isActive}`);

    recordAuditEvent({
      category: 'user',
      action: isActive ? 'user.activated' : 'user.deactivated',
      req,
      statusCode: 200,
      targetModel: 'User',
      targetId: updated._id,
      details: { email: updated.email, isActive },
    });

    res.json({
      success: true,
      user: {
        _id: updated._id,
        id: updated._id,
        name: updated.name,
        email: updated.email,
        role: getPrimaryRole(rolesOut),
        roles: rolesOut,
        isActive: updated.isActive,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/users/:id/review-queue — admin: approve or reject a pending self-registration
 */
export async function reviewQueueUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? (req.params.id[0] ?? '') : (req.params.id ?? '');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid ID format', 400);
    }

    const { decision } = req.body as { decision: 'approve' | 'reject' };
    const actor = req.user as IUser;

    if (String(actor._id) === id) {
      throw new AppError('You cannot review your own account', 400);
    }

    const target = await User.findById(id);
    if (!target) {
      throw new AppError('User not found', 404);
    }

    if (target.isVerified !== false) {
      throw new AppError('This account is not pending verification', 400);
    }

    if (decision === 'approve') {
      const updated = await User.findByIdAndUpdate(
        id,
        { isVerified: true, isActive: true },
        { new: true, runValidators: true }
      ).select('-password');

      if (!updated) {
        throw new AppError('User not found', 404);
      }

      const rolesOut = updated.getEffectiveRoles();
      logger.info(`reviewQueueUser approve: user=${id}`);

      recordAuditEvent({
        category: 'user',
        action: 'user.registration_approved',
        req,
        statusCode: 200,
        targetModel: 'User',
        targetId: updated._id,
        details: { email: updated.email },
      });

      res.json({
        success: true,
        user: {
          _id: updated._id,
          id: updated._id,
          name: updated.name,
          email: updated.email,
          role: getPrimaryRole(rolesOut),
          roles: rolesOut,
          isActive: updated.isActive,
          isVerified: updated.isVerified,
        },
      });
      return;
    }

    await Alumni.deleteMany({ user: id });
    const del = await User.deleteOne({ _id: id, isVerified: false });

    if (del.deletedCount === 0) {
      throw new AppError('User not found or not pending', 404);
    }

    logger.info(`reviewQueueUser reject (deleted): user=${id}`);
    recordAuditEvent({
      category: 'user',
      action: 'user.registration_rejected',
      req,
      statusCode: 200,
      targetModel: 'User',
      targetId: new mongoose.Types.ObjectId(id),
      details: { removed: true },
    });

    res.json({ success: true, removed: true });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/users/:id/cancel-deletion — admin: cancel a scheduled self-deletion
 */
export async function cancelUserDeletion(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? (req.params.id[0] ?? '') : (req.params.id ?? '');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid ID format', 400);
    }

    const actor = req.user as IUser;
    const target = await User.findById(id).select('-password');
    if (!target) {
      throw new AppError('User not found', 404);
    }

    if (!target.deletionScheduledFor) {
      throw new AppError('No deletion scheduled for this user', 400);
    }

    // Clear scheduled deletion fields and reactivate account
    target.deletionScheduledFor = undefined;
    target.deletionRequestedAt = undefined;
    target.deletionDeleteDocuments = undefined;
    target.isActive = true;
    await target.save();

    const rolesOut = target.getEffectiveRoles();
    logger.info(`cancelUserDeletion: user=${id} by=${String(actor._id)}`);

    recordAuditEvent({
      category: 'user',
      action: 'user.self_delete_cancelled',
      req,
      statusCode: 200,
      targetModel: 'User',
      targetId: target._id,
      details: { email: target.email, cancelledBy: String(actor._id) },
    });

    // Notify the user
    try {
      const notif = await createNotification({
        userId: target._id,
        title: 'Account deletion cancelled',
        message: 'An administrator has cancelled the scheduled deletion of your account. Your account is active again.',
        type: 'system',
        actorId: actor._id,
        sourceModel: 'User',
        sourceId: target._id,
      });
      emitNotification(target._id.toString(), serializeNotification(notif));
    } catch (err) {
      logger.warn('Failed to create/emit cancellation notification', err);
    }

    res.json({
      success: true,
      user: {
        _id: target._id,
        id: target._id,
        name: target.name,
        email: target.email,
        role: getPrimaryRole(rolesOut),
        roles: rolesOut,
        isActive: target.isActive,
        deletionScheduledFor: target.deletionScheduledFor,
      },
    });
  } catch (err) {
    next(err);
  }
}
