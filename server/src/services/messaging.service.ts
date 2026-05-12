/**
 * ============================================================
 * Messaging Service - Permissions, conversations, message helpers
 * ============================================================
 */

import mongoose from 'mongoose';
import type { IUser } from '../models/User.js';
import type { UserRole } from '../models/User.js';
import { SiteConfig } from '../models/SiteConfig.js';
import type { ISiteConfig } from '../models/SiteConfig.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Alumni } from '../models/Alumni.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../utils/AppError.js';

export type CanMessageResult = { ok: true } | { ok: false; reason: string };

const STAFF_MESSAGING_ROLES: UserRole[] = ['superadmin', 'admin', 'hod', 'faculty'];

export function getEffectiveRoles(user: IUser): UserRole[] {
  return user.getEffectiveRoles?.() ?? (user.roles?.length ? user.roles : [user.role]);
}

export function isPrivilegedMessenger(user: IUser): boolean {
  const roles = getEffectiveRoles(user);
  return roles.includes('superadmin') || roles.some((r) => STAFF_MESSAGING_ROLES.includes(r));
}

/** Recipient acts as “administration” for alumni DM policy */
export function hasAdministrationRole(user: IUser): boolean {
  const roles = getEffectiveRoles(user);
  return roles.some((r) => ['superadmin', 'admin', 'hod'].includes(r));
}

export function isAlumniOnly(user: IUser): boolean {
  const roles = getEffectiveRoles(user);
  return roles.includes('alumni') && !roles.some((r) => STAFF_MESSAGING_ROLES.includes(r));
}

/** Admin / HOD / Superadmin may bypass pairwise alumni rules */
export function isMessagingModerator(user: IUser): boolean {
  const roles = getEffectiveRoles(user);
  return roles.includes('superadmin') || roles.some((r) => ['admin', 'hod'].includes(r));
}

export async function getMessagingSiteConfig(): Promise<ISiteConfig> {
  return SiteConfig.getConfig();
}

/**
 * Whether sender may start or continue messaging recipient (non-admin override).
 */
export function canMessagePair(
  sender: IUser,
  recipient: IUser,
  site: Pick<
    ISiteConfig,
    | 'messagingEnabled'
    | 'alumniCanMessageFaculty'
    | 'alumniCanMessageAdmin'
    | 'facultyMustOptInForAlumniChat'
  >
): CanMessageResult {
  if (!site.messagingEnabled) {
    return { ok: false, reason: 'Messaging is disabled by the platform.' };
  }
  if (!sender.isActive) {
    return { ok: false, reason: 'Your account is inactive.' };
  }
  if (!recipient.isActive) {
    return { ok: false, reason: 'Recipient account is inactive.' };
  }
  if (sender.messagingBanned) {
    return { ok: false, reason: 'You are banned from messaging.' };
  }
  if (recipient.messagingBanned) {
    return { ok: false, reason: 'Recipient cannot receive messages.' };
  }

  if (isPrivilegedMessenger(sender)) {
    return { ok: true };
  }
  if (hasAdministrationRole(recipient)) {
    if (!site.alumniCanMessageAdmin) {
      return { ok: false, reason: 'Alumni cannot message administrators right now.' };
    }
    return { ok: true };
  }

  // If both are alumni-only, disallow (policy: no alumni->alumni)
  if (isAlumniOnly(sender) && isAlumniOnly(recipient)) {
    return { ok: false, reason: 'Messaging between alumni is not allowed.' };
  }

  // Admins handled above; staff/faculty handling:
  if (getEffectiveRoles(recipient).includes('faculty')) {
    if (!site.alumniCanMessageFaculty) {
      return { ok: false, reason: 'Alumni cannot message faculty right now.' };
    }
    const needsOptIn = site.facultyMustOptInForAlumniChat;
    if (needsOptIn && recipient.messagingOptIn === false && isAlumniOnly(sender)) {
      return { ok: false, reason: 'This faculty member has not enabled alumni messages.' };
    }
    // Additionally, if the sender is faculty and has opted-out, block alumni recipients
    if (getEffectiveRoles(sender).includes('faculty') && sender.messagingOptIn === false && isAlumniOnly(recipient)) {
      return { ok: false, reason: 'You have disabled alumni messages.' };
    }
    return { ok: true };
  }

  // If sender is alumni-only but recipient is not faculty/admin/alumni, disallow by default
  return { ok: false, reason: 'Messaging is not allowed between these accounts.' };
}

/**
 * Enforce send permission (REST + socket). Moderators bypass alumni/faculty rules but not global disable/sender ban.
 */
export async function assertCanSendMessage(
  sender: IUser,
  recipient: IUser,
  opts?: { moderatorOverride?: boolean }
): Promise<void> {
  const site = await getMessagingSiteConfig();
  if (!site.messagingEnabled) {
    throw new AppError('Messaging is disabled.', 403);
  }
  if (sender.messagingBanned) {
    throw new AppError('You are banned from messaging.', 403);
  }

  if (opts?.moderatorOverride && isMessagingModerator(sender)) {
    return;
  }

  const result = canMessagePair(sender, recipient, site);
  if (!result.ok) {
    throw new AppError(result.reason, 403);
  }
}

export function participantIdsInclude(conversation: { participants: mongoose.Types.ObjectId[] }, userId: string): boolean {
  return conversation.participants.some((p) => p.toString() === userId);
}

export async function findDirectConversation(
  userIdA: mongoose.Types.ObjectId | string,
  userIdB: mongoose.Types.ObjectId | string
) {
  const [a, b] = [userIdA.toString(), userIdB.toString()].sort();
  const key = `${a}:${b}`;
  return Conversation.findOne({ type: 'direct', participantPairKey: key }).exec();
}

export async function createConversation(params: {
  participants: [mongoose.Types.ObjectId, mongoose.Types.ObjectId];
  type: 'direct' | 'broadcast';
  createdBy: mongoose.Types.ObjectId;
  metadata?: { broadcastTitle?: string; broadcastRecipientCount?: number };
}) {
  const [p0, p1] = params.participants;
  const doc = await Conversation.create({
    participants: [p0, p1],
    type: params.type,
    createdBy: params.createdBy,
    metadata: params.metadata ?? {},
    lastMessageAt: new Date(),
  });
  return doc;
}

export async function getUnreadCountForUser(
  userId: mongoose.Types.ObjectId | string,
  conversationId: mongoose.Types.ObjectId | string
): Promise<number> {
  const uid = new mongoose.Types.ObjectId(userId.toString());
  const cid = new mongoose.Types.ObjectId(conversationId.toString());
  const count = await Message.countDocuments({
    conversation: cid,
    sender: { $ne: uid },
    isDeleted: false,
    $expr: { $not: { $in: [uid, '$readBy'] } },
  }).exec();
  return count;
}

export async function touchConversationLastMessage(
  conversationId: mongoose.Types.ObjectId | string,
  messageId: mongoose.Types.ObjectId
): Promise<void> {
  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: messageId,
    lastMessageAt: new Date(),
  }).exec();
}

export async function resolveAlumniUserIds(filters: {
  department?: string;
  batch?: string;
  graduationYear?: number;
  allAlumni?: boolean;
}): Promise<mongoose.Types.ObjectId[]> {
  const query: Record<string, unknown> = {};
  if (!filters.allAlumni) {
    if (filters.department) query.department = filters.department;
    if (filters.batch) query.batch = filters.batch;
    if (filters.graduationYear != null) query.graduationYear = filters.graduationYear;
  }

  const alumni = await Alumni.find(query).select('user').lean().exec();
  const ids = alumni.map((a) => a.user as mongoose.Types.ObjectId);
  logger.debug(`resolveAlumniUserIds: matched ${ids.length} alumni`);
  return ids;
}
