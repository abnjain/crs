/**
 * ============================================================
 * Server Entry Point
 * Connects MongoDB, Redis, starts Express with graceful shutdown
 * ============================================================
 */

import mongoose from 'mongoose';
import http from 'http';
import app from './app.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { initRedis, closeRedis } from './services/redis.service.js';
import { initSocketServer, closeSocketServer } from './services/socket.service.js';
import { probeMail } from './services/mail.service.js';

const PORT = config.port;
let httpServer: http.Server | null = null;

/**
 * Connect to MongoDB
 */
async function connectMongo(): Promise<void> {
  try {
    await mongoose.connect(config.mongoUri);
    const dbName = mongoose.connection.db?.databaseName ?? 'unknown';
    logger.info(`MongoDB connected to database: ${dbName}`);
    logger.debug(`MongoDB URI: ${config.mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);
  } catch (err) {
    logger.error('MongoDB connection failed:', err);
    process.exit(1);
  }
}

/**
 * Start the HTTP server
 */
async function startServer(): Promise<void> {
  await connectMongo();
  await initRedis();
  await probeMail(); // Probe SMTP at startup

  const redactedConfig = {
    ...config,
    mongoUri: config.mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'),
    redisUrl: config.redisUrl ? config.redisUrl.replace(/:(?:[^@]+)@/, ':****@') : undefined,
    jwtPrivateKey: config.jwtPrivateKey ? '[redacted]' : undefined,
    jwtPublicKey: config.jwtPublicKey ? '[redacted]' : undefined,
    jwtSecret: config.jwtSecret ? '[redacted]' : undefined,
    jwtSignKey: config.jwtSignKey ? '[redacted]' : undefined,
    jwtVerifyKey: config.jwtVerifyKey ? '[redacted]' : undefined,
    smtpPass: config.smtpPass ? '[redacted]' : undefined,
    resendApiKey: config.resendApiKey ? '[redacted]' : undefined,
    s3AccessKeyId: config.s3AccessKeyId ? '[redacted]' : undefined,
    s3SecretAccessKey: config.s3SecretAccessKey ? '[redacted]' : undefined,
    libraryFeeWaiverKey: config.libraryFeeWaiverKey ? '[redacted]' : undefined,
  };

  logger.info(`Starting server with these configurations: ${JSON.stringify(redactedConfig, null, 2)}`);

  httpServer = http.createServer(app);
  await initSocketServer(httpServer);

  httpServer.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`API: ${config.apiPrefix}/v1`);
    logger.info(`Socket.IO path: /socket.io`);
  });
}

/**
 * Graceful shutdown - close connections properly
 */
function gracefulShutdown(signal: string): void {
  logger.info(`${signal} received. Shutting down gracefully...`);

  if (httpServer) {
    httpServer.close(async () => {
      logger.info('HTTP server closed');

      try {
        await closeSocketServer();
      } catch (err) {
        logger.error('Error closing Socket.IO:', err);
      }

      try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed');
      } catch (err) {
        logger.error('Error closing MongoDB:', err);
      }

      await closeRedis();
      process.exit(0);
    });

    // Force close after 10s
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
}

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

startServer().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
