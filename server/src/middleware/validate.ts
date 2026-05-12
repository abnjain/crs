/**
 * ============================================================
 * Request Validation Middleware (Zod)
 * Validates req.body, req.query, req.params
 * ============================================================
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';

type ValidatorSource = 'body' | 'query' | 'params';

/**
 * Create validation middleware for a given schema and source
 */
export function validate<T>(schema: ZodSchema<T>, source: ValidatorSource = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const data = req[source];
      const result = schema.parse(data) as T;
      if (source === 'query') {
        if (req.query && typeof req.query === 'object') {
          Object.assign(req.query, result as Record<string, unknown>);
        }
      } else {
        (req as Request & Record<string, T>)[source] = result;
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const messages = err.issues
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join('; ');
        next(new AppError(messages, 400));
      } else {
        next(err);
      }
    }
  };
}
