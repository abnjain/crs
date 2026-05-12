/**
 * ============================================================
 * Authentication Middleware
 * Verifies JWT and attaches user to request
 * ============================================================
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { AppError } from '../utils/AppError.js';
import { User } from '../models/User.js';
import { logger } from '../utils/logger.js';

/**
 * Protect routes - requires valid JWT in Authorization header
 */
export async function protect(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  let token: string | undefined;
  const authHeader = req.headers.authorization;

  const cookieToken = req.cookies?.[config.authCookieName];
  if (typeof cookieToken === 'string' && cookieToken.trim()) {
    token = cookieToken.trim();
  }

  if (!token && authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    logger.debug('Auth failed: no token provided');
    next(new AppError('Not authorized. Please log in.', 401));
    return;
  }

  try {
    if (!config.jwtVerifyKey) {
      next(new AppError('JWT verification key not configured', 500));
      return;
    }
    const decoded = jwt.verify(token, config.jwtVerifyKey, {
      algorithms: [config.jwtAlgorithm],
    }) as { id: string };
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      logger.warn('Auth failed: user not found for token');
      next(new AppError('User no longer exists', 401));
      return;
    }
    if (user.isVerified === false) {
      next(new AppError('Your account is pending administrator approval.', 403));
      return;
    }
    if (!user.isActive) {
      next(new AppError('Account is deactivated', 403));
      return;
    }
    req.user = user;
    next();
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === 'JsonWebTokenError') {
        logger.debug('Auth failed: invalid JWT');
        next(new AppError('Invalid token', 401));
        return;
      }
      if (err.name === 'TokenExpiredError') {
        logger.debug('Auth failed: token expired');
        next(new AppError('Token expired', 401));
        return;
      }
    }
    next(err);
  }
}

/**
 * For logging only: valid Bearer JWT + existing user → email. Invalid/expired token → undefined.
 */
export async function getOptionalAuthEmail(req: Request): Promise<string | undefined> {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.[config.authCookieName];
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;
  const token = typeof cookieToken === 'string' && cookieToken.trim() ? cookieToken.trim() : bearerToken;
  if (!token) return undefined;
  try {
    if (!config.jwtVerifyKey) return undefined;
    const decoded = jwt.verify(token, config.jwtVerifyKey, {
      algorithms: [config.jwtAlgorithm],
    }) as { id: string };
    const user = await User.findById(decoded.id).select('email').lean<{ email?: string } | null>();
    const email = user?.email?.trim();
    return email || undefined;
  } catch {
    return undefined;
  }
}
