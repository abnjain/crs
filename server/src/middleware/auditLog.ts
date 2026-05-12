/**
 * ============================================================
 * Audit Log Middleware - Persist API activity to AuditLog collection
 * Runs after response finishes; skips noisy health probes
 * ============================================================
 */

import { Request, Response, NextFunction } from 'express';
import { type AuditCategory } from '../models/AuditLog.js';
import { logger } from '../utils/logger.js';
import { recordAuditEvent } from '../services/audit.service.js';

function fullPath(req: Request): string {
  const raw = req.originalUrl || `${req.baseUrl || ''}${req.path || ''}` || '';
  return raw.split('?')[0] || '/';
}

function shouldSkipPersist(pathNorm: string, method: string): boolean {
  if (method.toUpperCase() === 'OPTIONS') return true;
  const p = pathNorm.toLowerCase();
  return p.includes('/health') || p.endsWith('/favicon.ico');
}

function categorizeAndAction(
  method: string,
  pathNorm: string,
  statusCode: number
): { category: AuditCategory; action: string } {
  const p = pathNorm.toLowerCase();
  const m = method.toUpperCase();

  if (p.includes('/auth/login')) {
    return {
      category: 'auth',
      action: statusCode >= 400 ? 'auth.login_failed' : 'user.login',
    };
  }
  if (p.includes('/auth/register')) {
    return {
      category: 'auth',
      action: statusCode >= 400 ? 'auth.register_failed' : 'user.register',
    };
  }
  if (p.includes('/auth/me')) {
    return { category: 'auth', action: 'user.session' };
  }

  if (p.includes('/users')) {
    if (m === 'GET' && /\/users\/?$/i.test(p)) return { category: 'user', action: 'user.list' };
    if (m === 'POST' && /\/users\/?$/i.test(p)) return { category: 'user', action: 'user.create' };
    if (m === 'GET') return { category: 'user', action: 'user.get' };
    return { category: 'user', action: `user.${m.toLowerCase()}` };
  }

  if (p.includes('/alumni')) {
    if (m === 'GET' && /\/alumni\/?$/i.test(p)) return { category: 'alumni', action: 'alumni.list' };
    if (m === 'POST' && /\/alumni\/?$/i.test(p)) return { category: 'alumni', action: 'alumni.create' };
    if (m === 'PATCH' || m === 'PUT') return { category: 'alumni', action: 'alumni.update' };
    if (m === 'DELETE') return { category: 'alumni', action: 'alumni.delete' };
    if (m === 'GET') return { category: 'alumni', action: 'alumni.get' };
    return { category: 'alumni', action: `alumni.${m.toLowerCase()}` };
  }

  if (p.includes('/events')) {
    if (m === 'GET' && /\/events\/?$/i.test(p)) return { category: 'event', action: 'event.list' };
    if (m === 'POST' && /\/events\/?$/i.test(p)) return { category: 'event', action: 'event.create' };
    if (m === 'PATCH' || m === 'PUT') return { category: 'event', action: 'event.update' };
    if (m === 'DELETE') return { category: 'event', action: 'event.delete' };
    if (m === 'GET') return { category: 'event', action: 'event.get' };
    return { category: 'event', action: `event.${m.toLowerCase()}` };
  }

  if (p.includes('/audit-logs')) {
    return { category: 'system', action: 'audit.access' };
  }
  if (p.includes('/site-config')) {
    return { category: 'system', action: m === 'PATCH' ? 'system.config_update' : 'system.config_read' };
  }
  if (p.includes('/reports')) {
    return { category: 'system', action: 'reports.summary' };
  }

  return { category: 'api', action: `api.${m.toLowerCase()}` };
}

export function persistAuditLog(req: Request, res: Response, next: NextFunction): void {
  const pathNorm = fullPath(req);

  res.on('finish', () => {
    if (shouldSkipPersist(pathNorm, req.method)) return;

    try {
      const statusCode = res.statusCode;
      const { category, action } = categorizeAndAction(req.method, pathNorm, statusCode);
      recordAuditEvent({
        action,
        category,
        req,
        statusCode,
        path: pathNorm,
      });
    } catch (err) {
      logger.warn('persistAuditLog: error building entry', err);
    }
  });

  next();
}
