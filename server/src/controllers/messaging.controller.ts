/**
 * ============================================================
 * Messaging Controller - Conversations, messages, faculty opt-in
 * ============================================================
 */

import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';
import {
  assertCanSendMessage,
  canMessagePair,
  createConversation,
  findDirectConversation,
  getMessagingSiteConfig,
  getUnreadCountForUser,
  isMessagingModerator,
  participantIdsInclude,
  touchConversationLastMessage,
} from '../services/messaging.service.js';
import {
  emitConversationUpdated,
  emitMessageDeleted,
  emitNewMessage,
  emitReadReceipt,
  emitNotification,
} from '../services/socket.service.js';
import { createNotification, serializeNotification } from '../services/notification.service.js';

function serializeUserBrief(u: { _id: mongoose.Types.ObjectId; name: string; email: string }) {
  return { id: u._id.toString(), name: u.name, email: u.email };
}

/**
 * Search users by name (for starting a DM)
 * GET /api/v1/messaging/users/search?q=query
 */
export async function searchUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      users: users.map((u) => serializeUserBrief(u)),
    });
  } catch (err) {
    next(err);
  }
}

function serializeMessageDoc(
  m: InstanceType<typeof Message>,
  viewerId: string,
  moderator: boolean
): Record<string, unknown> {
  const senderId = m.sender.toString();
  const deletedForViewer = Array.isArray(m.deletedFor) && (m.deletedFor as any[]).some((id) => id.toString() === viewerId);
  const deleted = m.isDeleted && !moderator; // global deletion
  return {
    id: m._id.toString(),
    conversationId: m.conversation.toString(),
    senderId,
    content: deleted ? '' : deletedForViewer ? '' : m.content,
    type: m.type,
    readBy: (m.readBy ?? []).map((id) => id.toString()),
    isDeleted: m.isDeleted,
    deletedForViewer: deletedForViewer || deleted,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  };
}

async function otherParticipant(conversation: InstanceType<typeof Conversation>, selfId: string) {
  const other = conversation.participants.find((p) => p.toString() !== selfId);
  if (!other) throw new AppError('Invalid conversation', 400);
  const user = await User.findById(other).select('-password').exec();
  if (!user) throw new AppError('Participant not found', 404);
  return user;
}

export async function updateMessagingOptIn(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { messagingOptIn } = req.body as { messagingOptIn: boolean };
    const user = await User.findById(req.user!._id).exec();
    if (!user) throw new AppError('User not found', 404);
    user.messagingOptIn = messagingOptIn;
    await user.save();
    res.json({ success: true, user: { ...serializeUserBrief(user), messagingOptIn: user.messagingOptIn } });
  } catch (err) {
    next(err);
  }
}

export async function listConversations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!._id.toString();
    const includeArchived = req.query.includeArchived === 'true';
    const limit = Math.min(parseInt(String(req.query.limit ?? '40'), 10) || 40, 100);
    const page = Math.max(parseInt(String(req.query.page ?? '1'), 10) || 1, 1);
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {
      participants: new mongoose.Types.ObjectId(userId),
    };
    if (!includeArchived) {
      filter.$expr = { $not: { $in: [new mongoose.Types.ObjectId(userId), '$archivedBy'] } };
    }

    const [items, total] = await Promise.all([
      Conversation.find(filter).sort({ lastMessageAt: -1 }).skip(skip).limit(limit).lean().exec(),
      Conversation.countDocuments(filter).exec(),
    ]);

    const enriched = await Promise.all(
      items.map(async (c) => {
        const otherId = (c.participants as mongoose.Types.ObjectId[])
          .map((p) => p.toString())
          .find((id) => id !== userId)!;
        const otherUser = await User.findById(otherId).select('name email messagingBanned messagingOptIn').lean().exec();
        const unread = await getUnreadCountForUser(userId, c._id.toString());
        let preview = '';
        if (c.lastMessage) {
          const last = await Message.findById(c.lastMessage).select('content isDeleted sender').lean().exec();
          if (last) preview = last.isDeleted ? '[Deleted]' : last.content.slice(0, 140);
        }
        return {
          id: c._id.toString(),
          type: c.type,
          createdAt: c.createdAt,
          lastMessageAt: c.lastMessageAt,
          metadata: c.metadata,
          otherParticipant: otherUser
            ? {
                id: otherUser._id.toString(),
                name: otherUser.name,
                email: otherUser.email,
                messagingBanned: otherUser.messagingBanned ?? false,
                messagingOptIn: otherUser.messagingOptIn ?? true,
              }
            : null,
          unreadCount: unread,
          preview,
        };
      })
    );

    res.json({
      success: true,
      conversations: enriched,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    });
  } catch (err) {
    next(err);
  }
}

export async function createDirectConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sender = req.user!;
    const { participantId } = req.body as { participantId: string };
    if (participantId === sender._id.toString()) {
      throw new AppError('Cannot message yourself', 400);
    }
    const recipient = await User.findById(participantId).select('-password').exec();
    if (!recipient) throw new AppError('User not found', 404);

    await assertCanSendMessage(sender, recipient, {
      moderatorOverride: isMessagingModerator(sender),
    });

    const existing = await findDirectConversation(sender._id, recipient._id);
    if (existing) {
      res.status(200).json({ success: true, conversationId: existing._id.toString(), created: false });
      return;
    }

    const conv = await createConversation({
      participants: [sender._id as mongoose.Types.ObjectId, recipient._id as mongoose.Types.ObjectId],
      type: 'direct',
      createdBy: sender._id as mongoose.Types.ObjectId,
    });

    logger.info(`DM created ${sender.email} <-> ${recipient.email}`);
    res.status(201).json({ success: true, conversationId: conv._id.toString(), created: true });
  } catch (err) {
    next(err);
  }
}

export async function getConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!._id.toString();
    const conv = await Conversation.findById(req.params.conversationId).exec();
    if (!conv) throw new AppError('Conversation not found', 404);
    const moderator = isMessagingModerator(req.user!);
    if (!participantIdsInclude(conv, userId) && !moderator) {
      throw new AppError('Access denied', 403);
    }
    const other = await otherParticipant(conv, userId);
    const site = await getMessagingSiteConfig();
    res.json({
      success: true,
      conversation: {
        id: conv._id.toString(),
        type: conv.type,
        lastMessageAt: conv.lastMessageAt,
        metadata: conv.metadata,
        archivedBy: (conv.archivedBy ?? []).map((id) => id.toString()),
        messagingEnabled: site.messagingEnabled,
        otherParticipant: serializeUserBrief(other),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function archiveConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!._id;
    const { archived } = req.body as { archived: boolean };
    const conv = await Conversation.findById(req.params.conversationId).exec();
    if (!conv) throw new AppError('Conversation not found', 404);
    if (!participantIdsInclude(conv, userId.toString())) {
      throw new AppError('Access denied', 403);
    }
    const set = new Set((conv.archivedBy ?? []).map((id) => id.toString()));
    if (archived) set.add(userId.toString());
    else set.delete(userId.toString());
    conv.archivedBy = [...set].map((id) => new mongoose.Types.ObjectId(id));
    await conv.save();
    res.json({ success: true, archivedBy: conv.archivedBy.map((id) => id.toString()) });
  } catch (err) {
    next(err);
  }
}

export async function markConversationRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!._id;
    const conv = await Conversation.findById(req.params.conversationId).exec();
    if (!conv) throw new AppError('Conversation not found', 404);
    if (!participantIdsInclude(conv, userId.toString())) {
      throw new AppError('Access denied', 403);
    }
    await Message.updateMany(
      {
        conversation: conv._id,
        sender: { $ne: userId },
        isDeleted: false,
      },
      { $addToSet: { readBy: userId } }
    ).exec();

    emitReadReceipt(conv._id.toString(), {
      readerId: userId.toString(),
      conversationId: conv._id.toString(),
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function listMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!._id.toString();
    const conv = await Conversation.findById(req.params.conversationId).exec();
    if (!conv) throw new AppError('Conversation not found', 404);
    const moderator = isMessagingModerator(req.user!);
    if (!participantIdsInclude(conv, userId) && !moderator) {
      throw new AppError('Access denied', 403);
    }

    const limit = Math.min(parseInt(String(req.query.limit ?? '50'), 10) || 50, 100);
    const before = req.query.before ? new Date(String(req.query.before)) : null;
    if (before && Number.isNaN(before.getTime())) {
      throw new AppError('Invalid cursor', 400);
    }

    const q: Record<string, unknown> = { conversation: conv._id };
    if (before) q.createdAt = { $lt: before };

    const docs = await Message.find(q)
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

    const viewerModerator = moderator;
    res.json({
      success: true,
      messages: docs.map((m) => serializeMessageDoc(m, userId, viewerModerator)),
      nextCursor: docs.length ? docs[docs.length - 1].createdAt?.toISOString?.() : null,
    });
  } catch (err) {
    next(err);
  }
}

export async function sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sender = req.user!;
    const { content } = req.body as { content: string };
    const conv = await Conversation.findById(req.params.conversationId).exec();
    if (!conv) throw new AppError('Conversation not found', 404);
    if (!participantIdsInclude(conv, sender._id.toString())) {
      throw new AppError('Access denied', 403);
    }

    const msg = await Message.create({
      conversation: conv._id,
      sender: sender._id,
      content,
      type: 'direct',
    });

    const other = conv.participants.find((p) => p.toString() !== sender._id.toString());
    const recipient = other ? await User.findById(other).exec() : null;

    await touchConversationLastMessage(conv._id, msg._id as mongoose.Types.ObjectId);

    const payload = serializeMessageDoc(msg, sender._id.toString(), isMessagingModerator(sender));
    emitNewMessage(conv._id.toString(), payload);
    emitConversationUpdated(conv._id.toString(), {
      lastMessageAt: new Date().toISOString(),
      preview: content.slice(0, 140),
      senderId: sender._id.toString(),
    });

    if (recipient?._id) {
      const notif = await createNotification({
        userId: recipient._id,
        title: `New message from ${sender.name ?? 'User'}`,
        message: content.slice(0, 180),
        type: 'message',
        link: `/dashboard/messages/${conv._id.toString()}`,
        actorId: sender._id,
        sourceModel: 'Conversation',
        sourceId: conv._id,
        data: { conversationId: conv._id.toString() },
      });
      emitNotification(recipient._id.toString(), serializeNotification(notif));
    }

    res.status(201).json({ success: true, message: payload });
  } catch (err) {
    next(err);
  }
}

export async function markMessageRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!._id;
    const msg = await Message.findById(req.params.messageId).exec();
    if (!msg) throw new AppError('Message not found', 404);
    const conv = await Conversation.findById(msg.conversation).exec();
    if (!conv || !participantIdsInclude(conv, userId.toString())) {
      throw new AppError('Access denied', 403);
    }
    await Message.findByIdAndUpdate(msg._id, { $addToSet: { readBy: userId } }).exec();

    emitReadReceipt(conv._id.toString(), {
      readerId: userId.toString(),
      messageId: msg._id.toString(),
      conversationId: conv._id.toString(),
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function deleteMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!._id.toString();
    const moderator = isMessagingModerator(req.user!);
    const msg = await Message.findById(req.params.messageId).exec();
    if (!msg) throw new AppError('Message not found', 404);
    const conv = await Conversation.findById(msg.conversation).exec();
    if (!conv || (!participantIdsInclude(conv, userId) && !moderator)) {
      throw new AppError('Access denied', 403);
    }
    const forMe = req.query.forMe === 'true' || req.body?.forMe === true;
    if (forMe) {
      // add this user to deletedFor
      await Message.findByIdAndUpdate(msg._id, { $addToSet: { deletedFor: new mongoose.Types.ObjectId(userId) } }).exec();
      // if both participants deleted, mark globally deleted
      await Message.updateMany(
        { _id: msg._id, isDeleted: false, $expr: { $gte: [{ $size: '$deletedFor' }, 2] } },
        { isDeleted: true, deletedAt: new Date() }
      ).exec();
    } else {
      if (!moderator && msg.sender.toString() !== userId) {
        throw new AppError('You can only delete your own messages', 403);
      }
      msg.isDeleted = true;
      msg.deletedAt = new Date();
      await msg.save();
    }

    emitMessageDeleted(conv._id.toString(), {
      messageId: msg._id.toString(),
      conversationId: conv._id.toString(),
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

/**
 * Clear conversation for the current user (add to deletedFor for all messages).
 * POST /api/v1/messaging/conversations/:conversationId/clear
 */
export async function clearConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!._id.toString();
    const conv = await Conversation.findById(req.params.conversationId).exec();
    if (!conv) throw new AppError('Conversation not found', 404);
    if (!participantIdsInclude(conv, userId) && !isMessagingModerator(req.user!)) {
      throw new AppError('Access denied', 403);
    }

    await Message.updateMany({ conversation: conv._id }, { $addToSet: { deletedFor: new mongoose.Types.ObjectId(userId) } }).exec();
    await Message.updateMany(
      { conversation: conv._id, isDeleted: false, $expr: { $gte: [{ $size: '$deletedFor' }, 2] } },
      { isDeleted: true, deletedAt: new Date() }
    ).exec();

    emitConversationUpdated(conv._id.toString(), { clearedBy: userId });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
