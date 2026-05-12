/**
 * ============================================================
 * Notification Service - create and serialize notifications
 * ============================================================
 */

import mongoose from 'mongoose';
import { Notification, type INotification, type NotificationType } from '../models/Notification.js';
import { User, type UserRole } from '../models/User.js';

export interface NotificationDTO {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  actorId?: string;
  sourceModel?: string;
  sourceId?: string;
  data?: Record<string, unknown>;
  readAt: string | null;
  createdAt?: string;
}

export interface CreateNotificationInput {
  userId: string | mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  actorId?: string | mongoose.Types.ObjectId;
  sourceModel?: string;
  sourceId?: string | mongoose.Types.ObjectId;
  data?: Record<string, unknown>;
}

export function serializeNotification(doc: INotification): NotificationDTO {
  return {
    id: doc._id.toString(),
    userId: doc.user.toString(),
    title: doc.title,
    message: doc.message,
    type: doc.type,
    link: doc.link,
    actorId: doc.actor?.toString(),
    sourceModel: doc.sourceModel,
    sourceId: doc.sourceId?.toString(),
    data: (doc.data as Record<string, unknown>) ?? undefined,
    readAt: doc.readAt ? doc.readAt.toISOString() : null,
    createdAt: doc.createdAt?.toISOString?.(),
  };
}

export async function createNotification(input: CreateNotificationInput): Promise<INotification> {
  const doc = await Notification.create({
    user: new mongoose.Types.ObjectId(input.userId.toString()),
    title: input.title,
    message: input.message,
    type: input.type,
    link: input.link,
    actor: input.actorId ? new mongoose.Types.ObjectId(input.actorId.toString()) : undefined,
    sourceModel: input.sourceModel,
    sourceId: input.sourceId ? new mongoose.Types.ObjectId(input.sourceId.toString()) : undefined,
    data: input.data,
  });
  return doc;
}

export async function createNotificationsForUsers(
  userIds: Array<string | mongoose.Types.ObjectId>,
  input: Omit<CreateNotificationInput, 'userId'>
): Promise<INotification[]> {
  const deduped = Array.from(
    new Set(
      userIds
        .map((id) => id.toString())
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
    )
  );

  if (!deduped.length) return [];

  const now = new Date();
  const docs = deduped.map((id) => ({
    user: new mongoose.Types.ObjectId(id),
    title: input.title,
    message: input.message,
    type: input.type,
    link: input.link,
    actor: input.actorId ? new mongoose.Types.ObjectId(input.actorId.toString()) : undefined,
    sourceModel: input.sourceModel,
    sourceId: input.sourceId ? new mongoose.Types.ObjectId(input.sourceId.toString()) : undefined,
    data: input.data,
    readAt: null,
    createdAt: now,
    updatedAt: now,
  }));

  const created = await Notification.insertMany(docs, { ordered: false });
  return created as INotification[];
}

export async function resolveActiveUserIds(): Promise<mongoose.Types.ObjectId[]> {
  const users = await User.find({ isActive: true, isVerified: { $ne: false } })
    .select('_id')
    .lean()
    .exec();
  return users.map((u) => u._id as mongoose.Types.ObjectId);
}

export async function resolveUserIdsByRoles(roles: UserRole[]): Promise<mongoose.Types.ObjectId[]> {
  if (!roles.length) return [];
  const users = await User.find({
    isActive: true,
    isVerified: { $ne: false },
    $or: [{ role: { $in: roles } }, { roles: { $in: roles } }],
  })
    .select('_id')
    .lean()
    .exec();
  return users.map((u) => u._id as mongoose.Types.ObjectId);
}
