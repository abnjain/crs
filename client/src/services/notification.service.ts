/**
 * ============================================================
 * Notification REST API client
 * ============================================================
 */

import { api } from './api';

export type NotificationType = 'message' | 'event' | 'document' | 'fee' | 'system';

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

export interface NotificationListResponse {
  notifications: NotificationDTO[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export const notificationService = {
  async list(params?: {
    page?: number;
    limit?: number;
    unread?: boolean;
    read?: boolean;
    type?: NotificationType;
  }): Promise<NotificationListResponse> {
    const { data } = await api.get<{
      success: boolean;
      notifications: NotificationDTO[];
      pagination: { page: number; limit: number; total: number; pages: number };
    }>('/v1/notifications', { params });
    return { notifications: data.notifications, pagination: data.pagination };
  },

  async unreadCount(): Promise<number> {
    const { data } = await api.get<{ success: boolean; unreadCount: number }>(
      '/v1/notifications/unread-count'
    );
    return data.unreadCount ?? 0;
  },

  async markRead(id: string): Promise<NotificationDTO> {
    const { data } = await api.patch<{ success: boolean; notification: NotificationDTO }>(
      `/v1/notifications/${id}/read`
    );
    return data.notification;
  },

  async markAllRead(): Promise<void> {
    await api.post('/v1/notifications/mark-all-read');
  },

  async broadcast(body: {
    title: string;
    message: string;
    type?: NotificationType;
    link?: string;
    roles?: string[];
    userIds?: string[];
    data?: Record<string, unknown>;
  }): Promise<{ created: number }> {
    const { data } = await api.post<{ success: boolean; created: number }>(
      '/v1/notifications/broadcast',
      body
    );
    return { created: data.created };
  },
};
