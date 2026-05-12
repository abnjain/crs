/**
 * ============================================================
 * Express Application - MVC Architecture
 * Configures middleware, routes, error handling
 * ============================================================
 */

import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { config } from './config/index.js';
import { corsMiddleware } from './middleware/cors.js';
import { csrfProtection } from './middleware/csrf.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { apiHitLog } from './middleware/apiHitLog.js';
import { errorHandler } from './middleware/errorHandler.js';
import apiRoutes from './routes/index.js';

const app = express();

if (config.isProduction) {
  app.set('trust proxy', 1);
}

// -----------------------------------------------------------------------
// Security & Headers
// -----------------------------------------------------------------------
app.disable('x-powered-by');
app.use(helmet());

// -----------------------------------------------------------------------
// CORS - Cross-Origin Resource Sharing
// -----------------------------------------------------------------------
app.use(corsMiddleware);

// -----------------------------------------------------------------------
// Body parsing
// -----------------------------------------------------------------------
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// -----------------------------------------------------------------------
// CSRF protection (double-submit cookie)
// -----------------------------------------------------------------------
app.use(csrfProtection);

// -----------------------------------------------------------------------
// Rate limiting
// -----------------------------------------------------------------------
app.use(rateLimiter);

// -----------------------------------------------------------------------
// API hit logging (console only)
// -----------------------------------------------------------------------
app.use(apiHitLog);

// -----------------------------------------------------------------------
// API Routes (versioned: /api/v1, /api/v2, ...)
// -----------------------------------------------------------------------
app.use(config.apiPrefix, apiRoutes);

// -----------------------------------------------------------------------
// Wildcard / 404 - catch-all for undefined routes (Express 5: named wildcard)
// -----------------------------------------------------------------------
app.all('/{*splat}', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// -----------------------------------------------------------------------
// Global error handler (must be last)
// -----------------------------------------------------------------------
app.use(errorHandler);

export default app;
