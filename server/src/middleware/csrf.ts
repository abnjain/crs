/**
 * ============================================================
 * CSRF Protection Middleware
 * Double-submit cookie with X-CSRF-Token header
 * ============================================================
 */

import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';
import { AppError } from '../utils/AppError.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const authBase = `${config.apiPrefix}/v1/auth`;
const CSRF_BYPASS_PATHS = new Set([
  `${authBase}/login`,
  `${authBase}/register`,
  `${authBase}/csrf`,
]);

function timingSafeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export function issueCsrfToken(res: Response): string {
  const token = crypto.randomBytes(config.csrfTokenBytes).toString('hex');
  res.cookie(config.csrfCookieName, token, {
    httpOnly: false,
    secure: config.cookieSecure,
    sameSite: config.cookieSameSite,
    domain: config.cookieDomain,
    path: '/',
    maxAge: config.authCookieMaxAgeMs,
  });
  return token;
}

export function clearCsrfToken(res: Response): void {
  res.cookie(config.csrfCookieName, '', {
    httpOnly: false,
    secure: config.cookieSecure,
    sameSite: config.cookieSameSite,
    domain: config.cookieDomain,
    path: '/',
    maxAge: 0,
  });
}

export function csrfProtection(req: Request, _res: Response, next: NextFunction): void {
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  if (CSRF_BYPASS_PATHS.has(req.path)) {
    next();
    return;
  }

  const hasAuthCookie = Boolean(req.cookies?.[config.authCookieName]);
  const hasAuthHeader = typeof req.headers.authorization === 'string' &&
    req.headers.authorization.toLowerCase().startsWith('bearer ');

  if (!hasAuthCookie && !hasAuthHeader) {
    next();
    return;
  }

  const headerValue = req.get(config.csrfHeaderName) || '';
  const cookieValue = req.cookies?.[config.csrfCookieName] || '';

  if (!headerValue || !cookieValue || !timingSafeEqual(headerValue, cookieValue)) {
    next(new AppError('Invalid CSRF token', 403));
    return;
  }

  next();
}
