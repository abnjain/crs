/**
 * ============================================================
 * Socket.IO - Realtime messaging (JWT handshake)
 * ============================================================
 */

import type { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { Server, type Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import mongoose from 'mongoose';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { User } from '../models/User.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import {
  assertCanSendMessage,
  isMessagingModerator,
  participantIdsInclude,
  touchConversationLastMessage,
} from './messaging.service.js';
import { createNotification, serializeNotification } from './notification.service.js';

/** Narrow Socket typing for our handshake auth payload */
type MessagingSocket = Socket;

let io: Server | null = null;
let redisPub: Redis | null = null;
let redisSub: Redis | null = null;

function getCookieValue(cookieHeader: string | undefined, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const [rawKey, ...rest] = part.trim().split('=');
    if (!rawKey || rest.length === 0) continue;
    if (rawKey === name) {
      return decodeURIComponent(rest.join('='));
    }
  }
  return undefined;
}

function roomConversation(id: string): string {
  return `conversation:${id}`;
}

function roomUser(id: string): string {
  return `user:${id}`;
}

export function getMessagingIo(): Server | null {
  return io;
}

export function emitNewMessage(conversationId: string, payload: unknown): void {
  io?.to(roomConversation(conversationId)).emit('new_message', payload);
}

export function emitConversationUpdated(conversationId: string, payload: unknown): void {
  io?.to(roomConversation(conversationId)).emit('conversation_updated', payload);
}

export function emitReadReceipt(conversationId: string, payload: unknown): void {
  io?.to(roomConversation(conversationId)).emit('read_receipt', payload);
}

export function emitMessageDeleted(conversationId: string, payload: unknown): void {
  io?.to(roomConversation(conversationId)).emit('message_deleted', payload);
}

export function emitUserBanned(userId: string, payload: unknown): void {
  io?.to(roomUser(userId)).emit('messaging_banned', payload);
}

export function emitNotification(userId: string, payload: unknown): void {
  io?.to(roomUser(userId)).emit('notification_new', payload);
}

export async function initSocketServer(httpServer: HTTPServer): Promise<void> {
  io = new Server(httpServer, {
    cors: {
      origin: config.corsOrigins,
      credentials: true,
    },
    path: '/socket.io',
  });

  if (config.redisUrl) {
    try {
      redisPub = new Redis(config.redisUrl, { maxRetriesPerRequest: 20 });
      redisSub = redisPub.duplicate();
      io.adapter(createAdapter(redisPub, redisSub));
      logger.info('Socket.IO Redis adapter enabled');
    } catch (err) {
      logger.warn('Socket.IO Redis adapter failed; continuing single-instance:', err);
      redisPub = null;
      redisSub = null;
    }
  }

  io.use(async (socket, next) => {
    try {
      const cookieToken = getCookieValue(
        socket.handshake.headers.cookie as string | undefined,
        config.authCookieName
      );
      const raw =
        (socket.handshake.auth?.token as string | undefined) ||
        cookieToken ||
        (typeof socket.handshake.headers.authorization === 'string'
          ? socket.handshake.headers.authorization.replace(/^Bearer\s+/i, '')
          : undefined);
      if (!raw) {
        next(new Error('Unauthorized'));
        return;
      }
      if (!config.jwtVerifyKey) {
        next(new Error('Unauthorized'));
        return;
      }
      const decoded = jwt.verify(raw, config.jwtVerifyKey, {
        algorithms: [config.jwtAlgorithm],
      }) as { id: string };
      const user = await User.findById(decoded.id).select('-password').exec();
      if (!user || !user.isActive) {
        next(new Error('Unauthorized'));
        return;
      }
      (socket.data as { userId: string }).userId = user._id.toString();
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket: MessagingSocket) => {
    const userId = (socket.data as { userId: string }).userId;
    if (!userId) {
      socket.disconnect(true);
      return;
    }

    void socket.join(roomUser(userId));
    io?.emit('user_online', { userId });

    socket.on('join_conversation', async (conversationId: string, cb?: (err?: string) => void) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
          cb?.('Invalid conversation');
          return;
        }
        const conv = await Conversation.findById(conversationId).exec();
        if (!conv || !participantIdsInclude(conv, userId)) {
          cb?.('Forbidden');
          return;
        }
        await socket.join(roomConversation(conversationId));
        cb?.();
      } catch (err) {
        logger.warn('join_conversation error:', err);
        cb?.('Error');
      }
    });

    socket.on('leave_conversation', async (conversationId: string) => {
      await socket.leave(roomConversation(conversationId));
    });

    socket.on(
      'send_message',
      async (
        payload: { conversationId: string; content: string },
        cb?: (err?: string, data?: unknown) => void
      ) => {
        try {
          const { conversationId, content } = payload ?? {};
          if (!conversationId || !content?.trim()) {
            cb?.('Invalid payload');
            return;
          }
          const sender = await User.findById(userId).select('-password').exec();
          if (!sender) {
            cb?.('Unauthorized');
            return;
          }
          const conv = await Conversation.findById(conversationId).exec();
          if (!conv || !participantIdsInclude(conv, userId)) {
            cb?.('Forbidden');
            return;
          }

          const otherId = conv.participants.map((p) => p.toString()).find((id) => id !== userId);
          if (!otherId) {
            cb?.('Invalid conversation');
            return;
          }
          const recipient = await User.findById(otherId).select('-password').exec();
          if (!recipient) {
            cb?.('Recipient missing');
            return;
          }

          await assertCanSendMessage(sender, recipient, {
            moderatorOverride: isMessagingModerator(sender),
          });

          const msg = await Message.create({
            conversation: conv._id,
            sender: sender._id,
            content: content.trim(),
            type: 'text',
            readBy: [sender._id],
          });

          await touchConversationLastMessage(conv._id, msg._id as mongoose.Types.ObjectId);

          emitNewMessage(conversationId, {
            id: msg._id.toString(),
            conversationId,
            senderId: userId,
            content: msg.content,
            type: msg.type,
            readBy: (msg.readBy ?? []).map((id) => id.toString()),
            isDeleted: false,
            deletedForViewer: false,
            createdAt: msg.createdAt,
          });

          emitConversationUpdated(conversationId, {
            lastMessageAt: msg.createdAt?.toISOString?.(),
            preview: msg.content.slice(0, 140),
            senderId: userId,
          });

          if (recipient?._id) {
            const notif = await createNotification({
              userId: recipient._id,
              title: `New message from ${sender.name ?? 'User'}`,
              message: msg.content.slice(0, 180),
              type: 'message',
              link: `/dashboard/messages/${conversationId}`,
              actorId: sender._id,
              sourceModel: 'Conversation',
              sourceId: conv._id,
              data: { conversationId },
            });
            emitNotification(recipient._id.toString(), serializeNotification(notif));
          }

          cb?.(undefined, { messageId: msg._id.toString() });
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Error';
          logger.warn('send_message socket error:', err);
          cb?.(msg);
        }
      }
    );

    socket.on('typing_start', ({ conversationId }: { conversationId: string }) => {
      if (!conversationId) return;
      socket.to(roomConversation(conversationId)).emit('typing', { conversationId, userId, typing: true });
    });

    socket.on('typing_stop', ({ conversationId }: { conversationId: string }) => {
      if (!conversationId) return;
      socket.to(roomConversation(conversationId)).emit('typing', { conversationId, userId, typing: false });
    });

    socket.on(
      'mark_read',
      async (
        payload: { conversationId: string },
        cb?: (err?: string) => void
      ) => {
        try {
          const { conversationId } = payload ?? {};
          if (!conversationId) {
            cb?.('Invalid');
            return;
          }
          const conv = await Conversation.findById(conversationId).exec();
          if (!conv || !participantIdsInclude(conv, userId)) {
            cb?.('Forbidden');
            return;
          }
          await Message.updateMany(
            {
              conversation: conv._id,
              sender: { $ne: new mongoose.Types.ObjectId(userId) },
              isDeleted: false,
            },
            { $addToSet: { readBy: new mongoose.Types.ObjectId(userId) } }
          ).exec();

          emitReadReceipt(conversationId, {
            readerId: userId,
            conversationId,
          });
          cb?.();
        } catch (err) {
          logger.warn('mark_read socket error:', err);
          cb?.('Error');
        }
      }
    );

    socket.on('disconnect', () => {
      io?.emit('user_offline', { userId });
    });
  });

  logger.info('Socket.IO initialized');
}

export async function closeSocketServer(): Promise<void> {
  if (io) {
    await new Promise<void>((resolve) => {
      io!.close(() => resolve());
    });
    io = null;
  }
  if (redisSub) {
    await redisSub.quit().catch(() => undefined);
    redisSub = null;
  }
  if (redisPub) {
    await redisPub.quit().catch(() => undefined);
    redisPub = null;
  }
}
