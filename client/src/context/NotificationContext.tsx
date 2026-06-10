/**
 * ============================================================
 * Notification context — unread badge + realtime updates
 * ============================================================
 */

import { createContext, useContext } from 'react';
import type { Socket } from 'socket.io-client';
import type { NotificationDTO } from '../services/notification.service';

export interface NotificationContextValue {
  unreadCount: number;
  recent: NotificationDTO[];
  refreshUnread: () => Promise<void>;
  refreshRecent: (limit?: number) => Promise<void>;
  markRead: (id: string, wasUnread?: boolean) => Promise<void>;
  markAllRead: () => Promise<void>;
  socket: Socket | null;
}

export const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return ctx;
}
