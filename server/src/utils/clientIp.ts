/**
 * Normalize Express client IP for logs (strip IPv4-mapped IPv6 prefix).
 */

import type { Request } from 'express';

export function normalizeClientIp(req: Request): string {
  const raw = req.ip || req.socket.remoteAddress;
  if (raw == null || raw === '') return 'unknown';
  const s = typeof raw === 'string' ? raw : String(raw);
  return s.startsWith('::ffff:') ? s.slice(7) : s;
}
