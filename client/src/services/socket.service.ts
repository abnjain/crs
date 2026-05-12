/**
 * ============================================================
 * Socket.IO client singleton for messaging
 * ============================================================
 */

import { io, type Socket } from 'socket.io-client';

let messagingSocket: Socket | null = null;
let notificationSocket: Socket | null = null;

function createSocket(token?: string): Socket {
  return io({
    path: '/socket.io',
    auth: token ? { token } : undefined,
    transports: ['websocket', 'polling'],
    autoConnect: true,
    withCredentials: true,
  });
}

export function getMessagingSocket(): Socket | null {
  return messagingSocket;
}

export function connectMessagingSocket(token?: string): Socket {
  if (messagingSocket?.connected) return messagingSocket;
  messagingSocket = createSocket(token);
  return messagingSocket;
}

export function disconnectMessagingSocket(): void {
  if (messagingSocket) {
    messagingSocket.removeAllListeners();
    messagingSocket.disconnect();
    messagingSocket = null;
  }
}

export function getNotificationSocket(): Socket | null {
  return notificationSocket;
}

export function connectNotificationSocket(token?: string): Socket {
  if (notificationSocket?.connected) return notificationSocket;
  notificationSocket = createSocket(token);
  return notificationSocket;
}

export function disconnectNotificationSocket(): void {
  if (notificationSocket) {
    notificationSocket.removeAllListeners();
    notificationSocket.disconnect();
    notificationSocket = null;
  }
}
