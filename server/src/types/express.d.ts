/**
 * ============================================================
 * Express Request Extension
 * Adds user property from auth middleware
 * ============================================================
 */

import type { IUser } from '../models/User.js';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
