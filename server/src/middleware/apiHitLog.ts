/**
 * ============================================================
 * API Hit Log Middleware
 * Logs every incoming API request with method, path, IP, etc.
 * ============================================================
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { normalizeClientIp } from '../utils/clientIp.js';

export function apiHitLog(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const ip = normalizeClientIp(req);
    const meta = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      ip,
      duration: `${duration}ms`,
      userAgent: req.get('user-agent')?.substring(0, 80),
    };
    logger.http(`API ${req.method} ${req.path} ${res.statusCode} · ip=${ip}`, meta);
  });

  next();
}
