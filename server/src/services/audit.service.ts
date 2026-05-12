/**
 * ============================================================
 * Audit Service - reusable audit event logging
 * ============================================================
 */

import { Request } from 'express';
import type { Types } from 'mongoose';
import { AuditLog, type AuditCategory } from '../models/AuditLog.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

type ObjectIdLike = Types.ObjectId | string;

export interface AuditEventInput {
  action: string;
  category: AuditCategory;
  req?: Request;
  actor?: ObjectIdLike;
  actorEmail?: string;
  targetModel?: string;
  targetId?: ObjectIdLike;
  statusCode?: number;
  method?: string;
  path?: string;
  ip?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
}

function normalizePath(req?: Request, fallback = '/'): string {
  if (!req) return fallback;
  const raw = req.originalUrl || `${req.baseUrl || ''}${req.path || ''}` || '';
  const trimmed = raw.split('?')[0] || '';
  return trimmed || fallback;
}

function normalizeMethod(method?: string): string {
  return (method || 'GET').toUpperCase();
}

function resolveStatusCode(input: AuditEventInput): number {
  if (typeof input.statusCode === 'number') return input.statusCode;
  const resStatus = input.req?.res?.statusCode;
  if (typeof resStatus === 'number' && resStatus > 0) return resStatus;
  return 200;
}

function resolveActor(input: AuditEventInput): {
  actor?: ObjectIdLike;
  actorEmail: string;
} {
  const actor = input.actor ?? input.req?.user?._id;
  const actorEmail =
    input.actorEmail ?? (typeof input.req?.user?.email === 'string' ? input.req?.user?.email : '');
  return { actor: actor || undefined, actorEmail };
}

function buildAuditEntry(input: AuditEventInput) {
  const { actor, actorEmail } = resolveActor(input);

  return {
    action: input.action,
    category: input.category,
    actor,
    actorEmail,
    targetModel: input.targetModel,
    targetId: input.targetId,
    method: normalizeMethod(input.method ?? input.req?.method),
    path: input.path ?? normalizePath(input.req),
    statusCode: resolveStatusCode(input),
    ip: input.ip ?? input.req?.ip ?? input.req?.socket.remoteAddress ?? '',
    userAgent: (input.userAgent ?? input.req?.get('user-agent') ?? '').substring(0, 500),
    details: input.details,
  };
}

export function recordAuditEvent(input: AuditEventInput): void {
  const entry = buildAuditEntry(input);

  if (config.auditConsoleLogs) {
    logger.info('AUDIT', entry);
  }

  void AuditLog.create(entry).catch((err: unknown) => {
    logger.warn('recordAuditEvent: failed to write audit entry', err);
  });
}
