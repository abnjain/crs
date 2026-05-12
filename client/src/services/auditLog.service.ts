/**
 * ============================================================
 * Audit log API client
 * ============================================================
 */

import { api } from './api';

export interface AuditLogActor {
  _id: string;
  name?: string;
  email?: string;
}

export interface AuditLogRecord {
  _id: string;
  action: string;
  category: string;
  actor?: AuditLogActor;
  actorEmail: string;
  targetModel?: string;
  targetId?: string;
  method: string;
  path: string;
  statusCode: number;
  ip: string;
  userAgent: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

export interface AuditLogsParams {
  page?: number;
  limit?: number;
  category?: string;
  action?: string;
}

export interface AuditLogsResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  logs: AuditLogRecord[];
}

export interface AuditStatsResponse {
  success: boolean;
  byCategory: { category: string; count: number }[];
}

export const auditLogService = {
  async getLogs(params?: AuditLogsParams): Promise<AuditLogsResponse> {
    const { data } = await api.get<AuditLogsResponse>('/v1/audit-logs', { params });
    return data;
  },

  async getStats(): Promise<AuditStatsResponse> {
    const { data } = await api.get<AuditStatsResponse>('/v1/audit-logs/stats');
    return data;
  },
};
