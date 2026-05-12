/**
 * ============================================================
 * Notification Controller - list, read, broadcast
 * ============================================================
 */

import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { recordAuditEvent } from '../services/audit.service.js';
import {
  createNotification,
  createNotificationsForUsers,
  resolveActiveUserIds,
  resolveUserIdsByRoles,
  serializeNotification,
} from '../services/notification.service.js';
import { emitNotification } from '../services/socket.service.js';
import type { BroadcastNotificationBody } from '../validators/notification.validator.js';

function getParamId(req: Request, key: string): string {
  const raw = req.params[key];
  return Array.isArray(raw) ? (raw[0] ?? '') : (raw ?? '');
}

export async function listNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!._id;
    const limit = Math.min(parseInt(String(req.query.limit ?? '20'), 10) || 20, 100);
    const page = Math.max(parseInt(String(req.query.page ?? '1'), 10) || 1, 1);
    const skip = (page - 1) * limit;
    const unreadOnly = String(req.query.unread ?? '').toLowerCase() === 'true';
    const readOnly = String(req.query.read ?? '').toLowerCase() === 'true';
    const type = typeof req.query.type === 'string' ? req.query.type.trim() : '';

    const filter: Record<string, unknown> = { user: userId };
    if (readOnly) filter.readAt = { $ne: null };
    else if (unreadOnly) filter.readAt = null;
    if (type) filter.type = type;

    const [items, total] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      Notification.countDocuments(filter).exec(),
    ]);

    res.json({
      success: true,
      notifications: items.map((n) => serializeNotification(n)),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    });
  } catch (err) {
    next(err);
  }
}

export async function getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!._id;
    const total = await Notification.countDocuments({ user: userId, readAt: null }).exec();
    res.json({ success: true, unreadCount: total });
  } catch (err) {
    next(err);
  }
}

export async function markNotificationRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = getParamId(req, 'id');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid notification id', 400);
    }
    const userId = req.user!._id;
    const doc = await Notification.findOne({ _id: id, user: userId }).exec();
    if (!doc) throw new AppError('Notification not found', 404);
    if (!doc.readAt) {
      doc.readAt = new Date();
      await doc.save();
    }
    res.json({ success: true, notification: serializeNotification(doc) });
  } catch (err) {
    next(err);
  }
}

export async function markAllNotificationsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!._id;
    const result = await Notification.updateMany({ user: userId, readAt: null }, { readAt: new Date() }).exec();
    res.json({ success: true, updated: result.modifiedCount ?? result.nModified ?? 0 });
  } catch (err) {
    next(err);
  }
}

export async function broadcastNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body as BroadcastNotificationBody;
    const sender = req.user!;

    let targetIds: mongoose.Types.ObjectId[] = [];

    const userIds = body.userIds?.filter((id) => mongoose.Types.ObjectId.isValid(id)) ?? [];
    if (userIds.length) {
      const users = await User.find({ _id: { $in: userIds }, isActive: true })
        .select('_id')
        .lean()
        .exec();
      targetIds = users.map((u) => u._id as mongoose.Types.ObjectId);
    } else if (body.roles?.length) {
      targetIds = await resolveUserIdsByRoles(body.roles);
    } else {
      targetIds = await resolveActiveUserIds();
    }

    const filtered = targetIds.filter((id) => id.toString() !== sender._id.toString());
    const created = await createNotificationsForUsers(filtered, {
      title: body.title,
      message: body.message,
      type: body.type ?? 'system',
      link: body.link,
      actorId: sender._id,
      data: body.data,
      sourceModel: 'System',
    });

    created.forEach((doc) => {
      emitNotification(doc.user.toString(), serializeNotification(doc));
    });

    recordAuditEvent({
      category: 'system',
      action: 'notification.broadcast',
      req,
      statusCode: 201,
      details: { title: body.title, targetCount: created.length },
    });

    res.status(201).json({ success: true, created: created.length });
  } catch (err) {
    next(err);
  }
}

export async function createSystemNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, title, message, link } = req.body as {
      userId: string;
      title: string;
      message: string;
      link?: string;
    };
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new AppError('Invalid user id', 400);
    }
    const doc = await createNotification({
      userId,
      title,
      message,
      type: 'system',
      link,
      actorId: req.user!._id,
      sourceModel: 'System',
    });
    emitNotification(userId, serializeNotification(doc));
    res.status(201).json({ success: true, notification: serializeNotification(doc) });
  } catch (err) {
    next(err);
  }
}
