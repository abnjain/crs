/**
 * ============================================================
 * Messaging provider — Socket.IO, unread badge, presence
 * ============================================================
 */

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import type { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { MessagingContext } from './MessagingContext';
import { messagingService } from '../services/messaging.service';
import { connectMessagingSocket, disconnectMessagingSocket } from '../services/socket.service';

export function MessagingProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [totalUnread, setTotalUnread] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  const refreshUnread = useCallback(async () => {
    if (!isAuthenticated) {
      setTotalUnread(0);
      return;
    }
    try {
      const { conversations } = await messagingService.listConversations({ page: 1, limit: 100 });
      const sum = conversations.reduce((acc, c) => acc + (c.unreadCount ?? 0), 0);
      setTotalUnread(sum);
    } catch {
      /* ignore when offline */
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      disconnectMessagingSocket();
      return;
    }

    if (user.messagingBanned) {
      disconnectMessagingSocket();
      return;
    }

    const s = connectMessagingSocket();
    queueMicrotask(() => setSocket(s));

    queueMicrotask(() => {
      void refreshUnread();
    });

    const onConnect = () => {
      void refreshUnread();
    };

    const bumpUnread = () => {
      void refreshUnread();
    };

    const onBanned = (payload: { banned?: boolean; reason?: string }) => {
      if (payload?.banned) {
        toast.error(payload.reason ? `Messaging banned: ${payload.reason}` : 'You are banned from messaging.');
        disconnectMessagingSocket();
        setSocket(null);
      }
      void refreshUnread();
    };

    const onOnline = (p: { userId?: string }) => {
      const uid = p?.userId;
      if (!uid) return;
      setOnlineUsers((prev) => new Set(prev).add(uid));
    };

    const onOffline = (p: { userId?: string }) => {
      const uid = p?.userId;
      if (!uid) return;
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(uid);
        return next;
      });
    };

    s.on('connect', onConnect);
    s.on('conversation_updated', bumpUnread);
    s.on('new_message', bumpUnread);
    s.on('read_receipt', bumpUnread);
    s.on('message_deleted', bumpUnread);
    s.on('messaging_banned', onBanned);
    s.on('user_online', onOnline);
    s.on('user_offline', onOffline);

    return () => {
      s.off('connect', onConnect);
      s.off('conversation_updated', bumpUnread);
      s.off('new_message', bumpUnread);
      s.off('read_receipt', bumpUnread);
      s.off('message_deleted', bumpUnread);
      s.off('messaging_banned', onBanned);
      s.off('user_online', onOnline);
      s.off('user_offline', onOffline);
      disconnectMessagingSocket();
      setSocket(null);
      setOnlineUsers(new Set());
      setTotalUnread(0);
    };
  }, [isAuthenticated, user?.id, user?.messagingBanned, refreshUnread]);

  const value = useMemo(
    () => ({
      totalUnread: isAuthenticated && user?.id ? totalUnread : 0,
      refreshUnread,
      socket: isAuthenticated && user?.id && !user.messagingBanned ? socket : null,
      onlineUsers: isAuthenticated && user?.id ? onlineUsers : new Set<string>(),
    }),
    [isAuthenticated, user?.id, user?.messagingBanned, totalUnread, refreshUnread, socket, onlineUsers]
  );

  return <MessagingContext.Provider value={value}>{children}</MessagingContext.Provider>;
}
