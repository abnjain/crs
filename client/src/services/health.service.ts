/**
 * Health API service - server health check
 */

import { api } from './api';

export interface HealthDiagnostics {
  mongodbLatencyMs: number | null;
  redisLatencyMs: number | null;
  redisMemoryPercent: number | null;
  redisMemoryNote: string | null;
  nodeHeapPercent: number | null;
  probeDurationMs?: number;
  smtp: {
    configured: boolean;
    ok: boolean | null;
    detail: string;
    latencyMs: number | null;
  };
  storage: {
    usedBytes: number;
    totalBytes: number;
    usedLabel: string;
    totalLabel: string;
  } | null;
}

export interface HealthResponse {
  success: boolean;
  status: 'healthy' | 'degraded';
  timestamp: string;
  uptime: { seconds: number; formatted: string };
  memory: { heapUsed: number; heapTotal: number; rss: number; unit: string };
  services: {
    mongodb: string;
    mongodbDatabase?: string | null;
    redis: string;
    mail: { status: 'connected' | 'error' | 'disabled'; detail: string | null };
  };
  diagnostics?: HealthDiagnostics;
  version: string;
}

export const healthService = {
  getHealth: async (): Promise<HealthResponse> => {
    const { data } = await api.get<HealthResponse>('/v1/health');
    return data;
  },
};
