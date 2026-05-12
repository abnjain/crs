/**
 * ============================================================
 * Role-Based Access Control (RBAC) Middleware
 * Restricts route access to specific roles
 * ============================================================
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

/** CRS roles */
export const ROLES = ['superadmin', 'admin', 'hod', 'faculty', 'alumni', 'guest'] as const;
export type Role = (typeof ROLES)[number];

/**
 * Restrict route access to specific roles
 * Supports multi-role users: allows if any of user's roles matches
 * @param allowedRoles - Roles that can access the route
 */
export function restrictTo(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = req.user;
    if (!user) {
      logger.debug('RBAC failed: no user');
      next(new AppError('Authentication required', 401));
      return;
    }

    const userRoles = user.getEffectiveRoles?.() ?? (user.roles?.length ? user.roles : [user.role]);
    const hasAccess =
      userRoles.includes('superadmin') || userRoles.some((r) => allowedRoles.includes(r));

    if (!hasAccess) {
      logger.warn(`RBAC denied: ${user.email} roles=[${userRoles.join(', ')}] needs [${allowedRoles.join(', ')}]`);
      next(new AppError(`Access denied. Required roles: ${allowedRoles.join(', ')}`, 403));
      return;
    }

    next();
  };
}
