/**
 * ============================================================
 * Notification provider — unread badge + realtime updates
 * ============================================================
 */

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { NotificationContext } from './NotificationContext';
import { notificationService, type NotificationDTO } from '../services/notification.service';
import { connectNotificationSocket, disconnectNotificationSocket } from '../services/socket.service';

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [recent, setRecent] = useState<NotificationDTO[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  const refreshUnread = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    try {
      const count = await notificationService.unreadCount();
      setUnreadCount(count);
    } catch {
      /* ignore when offline */
    }
  }, [isAuthenticated]);

  const refreshRecent = useCallback(
    async (limit: number = 6) => {
      if (!isAuthenticated) {
        setRecent([]);
        return;
      }
      try {
        const res = await notificationService.list({ page: 1, limit });
        setRecent(res.notifications);
      } catch {
        /* ignore when offline */
      }
    },
    [isAuthenticated]
  );

  const markRead = useCallback(async (id: string, wasUnread?: boolean) => {
    try {
      const updated = await notificationService.markRead(id);
      setRecent((prev) => {
        return prev.map((n) => (n.id === id ? { ...n, readAt: updated.readAt } : n));
      });
      const shouldDecrement =
        wasUnread !== undefined ? wasUnread : recent.some((n) => n.id === id && !n.readAt);
      if (shouldDecrement && updated.readAt) {
        setUnreadCount((count) => Math.max(0, count - 1));
      }
    } catch {
      /* ignore when offline */
    }
  }, [recent]);

  const markAllRead = useCallback(async () => {
    try {
      await notificationService.markAllRead();
      const now = new Date().toISOString();
      setRecent((prev) => prev.map((n) => (n.readAt ? n : { ...n, readAt: now })));
      setUnreadCount(0);
    } catch {
      /* ignore when offline */
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      disconnectNotificationSocket();
      return;
    }

    const s = connectNotificationSocket();
    queueMicrotask(() => setSocket(s));

    queueMicrotask(() => {
      void refreshUnread();
      void refreshRecent();
    });

    const onConnect = () => {
      void refreshUnread();
      void refreshRecent();
    };

    const onNotification = (payload: NotificationDTO) => {
      if (payload.userId && payload.userId !== user.id) return;
      setRecent((prev) => {
        const next = [payload, ...prev.filter((n) => n.id !== payload.id)];
        return next.slice(0, 8);
      });
      if (!payload.readAt) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    s.on('connect', onConnect);
    s.on('notification_new', onNotification);

    return () => {
      s.off('connect', onConnect);
      s.off('notification_new', onNotification);
      disconnectNotificationSocket();
      setSocket(null);
      setUnreadCount(0);
      setRecent([]);
    };
  }, [isAuthenticated, user?.id, refreshUnread, refreshRecent]);

  const value = useMemo(
    () => ({
      unreadCount: isAuthenticated && user?.id ? unreadCount : 0,
      recent: isAuthenticated && user?.id ? recent : [],
      refreshUnread,
      refreshRecent,
      markRead,
      markAllRead,
      socket: isAuthenticated && user?.id ? socket : null,
    }),
    [isAuthenticated, user?.id, unreadCount, recent, refreshUnread, refreshRecent, markRead, markAllRead, socket]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}
