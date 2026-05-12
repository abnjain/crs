/**
 * ============================================================
 * Global Error Handling Middleware
 * Catches all errors, formats response, logs appropriately
 * Dev: detailed stack | Prod: generic message
 * ============================================================
 */

import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

interface ErrorWithStatus extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: number;
  errors?: Record<string, { message: string }>;
}

function sendErrorDev(err: ErrorWithStatus, res: Response): void {
  logger.error(`Error ${err.statusCode ?? 500}: ${err.message}`);
  if (err.stack) logger.debug('Stack: ' + err.stack);
  res.status(err.statusCode ?? 500).json({
    success: false,
    message: err.message,
    stack: err.stack,
    error: err,
  });
}

function sendErrorProd(err: ErrorWithStatus, res: Response): void {
  if (err.isOperational) {
    res.status(err.statusCode ?? 500).json({
      success: false,
      message: err.message,
    });
  } else {
    logger.error('Unexpected error:', err);
    res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
}

/**
 * Global error handler - must be last middleware
 */
export function errorHandler(
  err: ErrorWithStatus,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  err.statusCode = err.statusCode ?? 500;

  if (config.isDevelopment) {
    sendErrorDev(err, res);
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError' && err.errors) {
    const messages = Object.values(err.errors)
      .map((e) => e.message)
      .join('. ');
    err = new AppError(messages, 400);
  }
  // JWT invalid
  if (err.name === 'JsonWebTokenError') {
    err = new AppError('Invalid token', 401);
  }
  // Mongo duplicate key
  if (err.code === 11000) {
    err = new AppError('Duplicate field value', 400);
  }

  sendErrorProd(err, res);
}
