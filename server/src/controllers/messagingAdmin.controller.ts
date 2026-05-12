/**
 * ============================================================
 * Messaging Admin Controller - Oversight, broadcast, bans
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
  createConversation,
  touchConversationLastMessage,
  resolveAlumniUserIds,
} from '../services/messaging.service.js';
import {
  emitConversationUpdated,
  emitNewMessage,
  emitUserBanned,
} from '../services/socket.service.js';
import { recordAuditEvent } from '../services/audit.service.js';

function serializeMessageDoc(
  m: InstanceType<typeof Message>,
  viewerId: string,
  moderator: boolean
): Record<string, unknown> {
  const senderId = m.sender.toString();
  const deleted = m.isDeleted && senderId !== viewerId && !moderator;
  return {
    id: m._id.toString(),
    conversationId: m.conversation.toString(),
    senderId,
    content: deleted ? '' : m.content,
    type: m.type,
    readBy: (m.readBy ?? []).map((id) => id.toString()),
    isDeleted: m.isDeleted,
    deletedForViewer: deleted,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  };
}

export async function adminListConversations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const limit = Math.min(parseInt(String(req.query.limit ?? '40'), 10) || 40, 100);
    const page = Math.max(parseInt(String(req.query.page ?? '1'), 10) || 1, 1);
    const skip = (page - 1) * limit;
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';

    let filter: Record<string, unknown> = {};
    if (q) {
      const users = await User.find({
        $or: [{ email: new RegExp(q, 'i') }, { name: new RegExp(q, 'i') }],
      })
        .select('_id')
        .lean()
        .exec();
      const ids = users.map((u) => u._id);
      filter = { participants: { $in: ids } };
    }

    const [items, total] = await Promise.all([
      Conversation.find(filter).sort({ lastMessageAt: -1 }).skip(skip).limit(limit).lean().exec(),
      Conversation.countDocuments(filter).exec(),
    ]);

    const enriched = await Promise.all(
      items.map(async (c) => {
        const participants = await User.find({ _id: { $in: c.participants } })
          .select('name email role roles messagingBanned')
          .lean()
          .exec();
        let preview = '';
        if (c.lastMessage) {
          const last = await Message.findById(c.lastMessage).select('content isDeleted').lean().exec();
          if (last) preview = last.isDeleted ? '[Deleted]' : String(last.content).slice(0, 140);
        }
        return {
          id: c._id.toString(),
          type: c.type,
          lastMessageAt: c.lastMessageAt,
          metadata: c.metadata,
          participants: participants.map((p) => ({
            id: p._id.toString(),
            name: p.name,
            email: p.email,
            messagingBanned: p.messagingBanned ?? false,
          })),
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

export async function adminGetConversationMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!._id.toString();
    const conv = await Conversation.findById(req.params.conversationId).exec();
    if (!conv) throw new AppError('Conversation not found', 404);

    const limit = Math.min(parseInt(String(req.query.limit ?? '80'), 10) || 80, 200);
    const before = req.query.before ? new Date(String(req.query.before)) : null;
    if (before && Number.isNaN(before.getTime())) {
      throw new AppError('Invalid cursor', 400);
    }

    const q: Record<string, unknown> = { conversation: conv._id };
    if (before) q.createdAt = { $lt: before };

    const docs = await Message.find(q).sort({ createdAt: -1 }).limit(limit).exec();

    res.json({
      success: true,
      messages: docs.map((m) => serializeMessageDoc(m, userId, true)),
      nextCursor: docs.length ? docs[docs.length - 1].createdAt?.toISOString?.() : null,
    });
  } catch (err) {
    next(err);
  }
}

export async function adminBroadcast(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sender = req.user!;
    const { title, content, recipientUserIds, filters } = req.body as {
      title: string;
      content: string;
      recipientUserIds?: string[];
      filters?: {
        department?: string;
        batch?: string;
        graduationYear?: number;
        allAlumni?: boolean;
      };
    };

    const resolvedFromFilters =
      filters && Object.keys(filters).length > 0 ? await resolveAlumniUserIds(filters) : [];

    const explicit = recipientUserIds ?? [];
    const merged = [...new Set([...explicit.map(String), ...resolvedFromFilters.map((id) => id.toString())])].filter(
      (id) => id && id !== sender._id.toString()
    );

    if (!merged.length) {
      throw new AppError('No recipients resolved for broadcast', 400);
    }

    let createdThreads = 0;
    const errors: string[] = [];

    for (const rid of merged) {
      try {
        const recipient = await User.findById(rid).select('-password').exec();
        if (!recipient) {
          errors.push(`missing_user:${rid}`);
          continue;
        }

        await assertCanSendMessage(sender, recipient, { moderatorOverride: true });

        const conv = await createConversation({
          participants: [sender._id as mongoose.Types.ObjectId, recipient._id as mongoose.Types.ObjectId],
          type: 'broadcast',
          createdBy: sender._id as mongoose.Types.ObjectId,
          metadata: {
            broadcastTitle: title,
            broadcastRecipientCount: merged.length,
          },
        });

        const msg = await Message.create({
          conversation: conv._id,
          sender: sender._id,
          content,
          type: 'text',
          readBy: [sender._id],
        });

        await touchConversationLastMessage(conv._id, msg._id as mongoose.Types.ObjectId);

        emitNewMessage(conv._id.toString(), serializeMessageDoc(msg, sender._id.toString(), true));
        emitConversationUpdated(conv._id.toString(), {
          lastMessageAt: msg.createdAt?.toISOString?.(),
          preview: content.slice(0, 140),
          senderId: sender._id.toString(),
        });

        createdThreads += 1;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        errors.push(`${rid}:${msg}`);
      }
    }

    logger.info(`Broadcast by ${sender.email}: threads=${createdThreads} recipients=${merged.length}`);

    recordAuditEvent({
      category: 'system',
      action: 'messaging.broadcast',
      req,
      statusCode: 201,
      details: { title, recipientCount: merged.length, createdThreads, errors: errors.slice(0, 20) },
    });

    res.status(201).json({
      success: true,
      createdThreads,
      attemptedRecipients: merged.length,
      errors,
    });
  } catch (err) {
    next(err);
  }
}

export async function adminBanMessaging(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const target = await User.findById(req.params.userId).exec();
    if (!target) throw new AppError('User not found', 404);

    const { banned, reason } = req.body as { banned: boolean; reason?: string };
    target.messagingBanned = banned;
    target.messagingBannedReason = banned ? reason ?? '' : undefined;
    target.messagingBannedAt = banned ? new Date() : undefined;
    await target.save();

    emitUserBanned(target._id.toString(), {
      banned,
      reason: target.messagingBannedReason ?? '',
    });

    recordAuditEvent({
      category: 'user',
      action: banned ? 'messaging.user_banned' : 'messaging.user_unbanned',
      req,
      statusCode: 200,
      targetModel: 'User',
      targetId: target._id,
      details: { email: target.email, banned, reason },
    });

    res.json({
      success: true,
      user: {
        id: target._id.toString(),
        messagingBanned: target.messagingBanned,
        messagingBannedReason: target.messagingBannedReason,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function adminMessagingStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [conversationCount, messageCount, bannedUsers] = await Promise.all([
      Conversation.countDocuments().exec(),
      Message.countDocuments({ isDeleted: false }).exec(),
      User.countDocuments({ messagingBanned: true }).exec(),
    ]);

    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const messagesLast24h = await Message.countDocuments({ createdAt: { $gte: since24h }, isDeleted: false }).exec();

    res.json({
      success: true,
      stats: {
        conversationCount,
        messageCount,
        bannedUsers,
        messagesLast24h,
      },
    });
  } catch (err) {
    next(err);
  }
}
