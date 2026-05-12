/**
 * ============================================================
 * Messaging REST API client
 * ============================================================
 */

import { api } from './api';

export interface ConversationSummary {
  id: string;
  type: string;
  createdAt?: string;
  lastMessageAt?: string;
  metadata?: { broadcastTitle?: string; broadcastRecipientCount?: number };
  otherParticipant: {
    id: string;
    name: string;
    email: string;
    photo?: string;
    messagingBanned?: boolean;
    messagingOptIn?: boolean;
  } | null;
  unreadCount: number;
  preview: string;
}

export interface ConversationDetail {
  id: string;
  type: string;
  lastMessageAt?: string;
  metadata?: Record<string, unknown>;
  archivedBy: string[];
  messagingEnabled?: boolean;
  otherParticipant: { id: string; name: string; email: string };
}

export interface MessageDTO {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: string;
  readBy: string[];
  isDeleted: boolean;
  deletedForViewer?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminConversationRow {
  id: string;
  type: string;
  lastMessageAt?: string;
  metadata?: Record<string, unknown>;
  participants: { id: string; name: string; email: string; messagingBanned?: boolean }[];
  preview: string;
}

export interface SearchUserResult {
  id: string;
  name: string;
  email: string;
}

export const messagingService = {
  async searchUsers(q: string): Promise<(SearchUserResult & { canMessage: boolean; reason?: string })[]> {
    const { data } = await api.get<{ success: boolean; users: (SearchUserResult & { canMessage: boolean; reason?: string })[] }>(
      '/v1/messaging/users/search',
      { params: { q } }
    );
    return data.users;
  },

  async updateOptIn(messagingOptIn: boolean): Promise<void> {
    await api.patch('/v1/messaging/me/opt-in', { messagingOptIn });
  },

  async listConversations(params?: { page?: number; limit?: number; includeArchived?: boolean }): Promise<{
    conversations: ConversationSummary[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    const { data } = await api.get<{ success: boolean; conversations: ConversationSummary[]; pagination: unknown }>(
      '/v1/conversations',
      { params }
    );
    return data as { conversations: ConversationSummary[]; pagination: { page: number; limit: number; total: number; pages: number } };
  },

  async createDirectConversation(participantId: string): Promise<{ conversationId: string; created: boolean }> {
    const { data } = await api.post<{ success: boolean; conversationId: string; created: boolean }>(
      '/v1/conversations',
      { participantId }
    );
    return data;
  },

  async getConversation(conversationId: string): Promise<ConversationDetail> {
    const { data } = await api.get<{ success: boolean; conversation: ConversationDetail }>(
      `/v1/conversations/${conversationId}`
    );
    return data.conversation;
  },

  async archiveConversation(conversationId: string, archived: boolean): Promise<void> {
    await api.patch(`/v1/conversations/${conversationId}/archive`, { archived });
  },

  async markConversationRead(conversationId: string): Promise<void> {
    await api.patch(`/v1/conversations/${conversationId}/read-all`);
  },

  async listMessages(conversationId: string, params?: { limit?: number; before?: string }): Promise<{
    messages: MessageDTO[];
    nextCursor: string | null;
  }> {
    const { data } = await api.get<{ success: boolean; messages: MessageDTO[]; nextCursor: string | null }>(
      `/v1/conversations/${conversationId}/messages`,
      { params }
    );
    return { messages: data.messages, nextCursor: data.nextCursor };
  },

  async sendMessage(conversationId: string, content: string): Promise<MessageDTO> {
    const { data } = await api.post<{ success: boolean; message: MessageDTO }>(
      `/v1/conversations/${conversationId}/messages`,
      { content }
    );
    return data.message;
  },

  async deleteMessage(messageId: string, forMe = false): Promise<void> {
    await api.delete(`/v1/messages/${messageId}`, { params: { forMe } });
  },

  async clearConversation(conversationId: string): Promise<void> {
    await api.post(`/v1/conversations/${conversationId}/clear`);
  },

  async adminListConversations(params?: { page?: number; limit?: number; q?: string }): Promise<{
    conversations: AdminConversationRow[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    const { data } = await api.get<{
      success: boolean;
      conversations: AdminConversationRow[];
      pagination: { page: number; limit: number; total: number; pages: number };
    }>('/v1/admin/messaging/conversations', { params });
    return data;
  },

  async adminConversationMessages(
    conversationId: string,
    params?: { limit?: number; before?: string }
  ): Promise<{ messages: MessageDTO[]; nextCursor: string | null }> {
    const { data } = await api.get<{ success: boolean; messages: MessageDTO[]; nextCursor: string | null }>(
      `/v1/admin/messaging/conversations/${conversationId}/messages`,
      { params }
    );
    return { messages: data.messages, nextCursor: data.nextCursor };
  },

  async adminBroadcast(body: {
    title: string;
    content: string;
    recipientUserIds?: string[];
    filters?: {
      department?: string;
      batch?: string;
      graduationYear?: number;
      allAlumni?: boolean;
    };
  }): Promise<{ createdThreads: number; attemptedRecipients: number; errors: string[] }> {
    const { data } = await api.post<{
      success: boolean;
      createdThreads: number;
      attemptedRecipients: number;
      errors: string[];
    }>('/v1/admin/messaging/broadcast', body);
    return data;
  },

  async adminBanUser(userId: string, banned: boolean, reason?: string): Promise<void> {
    await api.patch(`/v1/admin/messaging/users/${userId}/ban`, { banned, reason });
  },

  async adminStats(): Promise<{
    conversationCount: number;
    messageCount: number;
    bannedUsers: number;
    messagesLast24h: number;
  }> {
    const { data } = await api.get<{ success: boolean; stats: Record<string, number> }>(
      '/v1/admin/messaging/stats'
    );
    return data.stats as {
      conversationCount: number;
      messageCount: number;
      bannedUsers: number;
      messagesLast24h: number;
    };
  },
};
