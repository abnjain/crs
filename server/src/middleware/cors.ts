/**
 * ============================================================
 * CORS (Cross-Origin Resource Sharing) Middleware
 * Environment-based allowed origins, methods, headers
 * ============================================================
 */

import cors from 'cors';
import { config } from '../config/index.js';

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, same-origin)
    if (!origin && config.isDevelopment) {
      return callback(null, true);
    }
    if (!origin) {
      return callback(null, true);
    }
    if (config.corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    config.csrfHeaderName,
  ],
  credentials: true,
};

export const corsMiddleware = cors(corsOptions);
