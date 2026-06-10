/**
 * ============================================================
 * Messaging context — Socket.IO, unread badge, presence
 * ============================================================
 */

import { createContext, useContext } from 'react';
import type { Socket } from 'socket.io-client';

export interface MessagingContextValue {
  totalUnread: number;
  refreshUnread: () => Promise<void>;
  socket: Socket | null;
  onlineUsers: Set<string>;
}

export const MessagingContext = createContext<MessagingContextValue | undefined>(undefined);

export function useMessaging(): MessagingContextValue {
  const ctx = useContext(MessagingContext);
  if (!ctx) {
    throw new Error('useMessaging must be used within MessagingProvider');
  }
  return ctx;
}
