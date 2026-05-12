/**
 * ============================================================
 * Environment-Based Configuration
 * Loads from .env with validation and sensible defaults
 * ============================================================
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load .env from server directory (works when cwd is project root or server/)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const NODE_ENV = process.env.NODE_ENV || 'development';
const isDevelopment = NODE_ENV === 'development';
const isProduction = NODE_ENV === 'production';

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  return fallback;
}

function normalizeKey(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.replace(/\\n/g, '\n');
}

function parseSameSite(value: string | undefined): 'lax' | 'strict' | 'none' {
  const normalized = (value ?? 'lax').trim().toLowerCase();
  if (normalized === 'none') return 'none';
  if (normalized === 'strict') return 'strict';
  return 'lax';
}

const jwtAlgorithm = (process.env.JWT_ALG || 'RS256').trim();
const cookieSameSite = parseSameSite(process.env.COOKIE_SAMESITE);
const cookieSecure = parseBool(process.env.COOKIE_SECURE, isProduction) || cookieSameSite === 'none';
const jwtPrivateKey = normalizeKey(process.env.JWT_PRIVATE_KEY);
const jwtPublicKey = normalizeKey(process.env.JWT_PUBLIC_KEY);
const jwtSecret = process.env.JWT_SECRET || 'change-me-in-production-crs-secret';
const jwtSignKey = jwtAlgorithm.toUpperCase().startsWith('HS') ? jwtSecret : jwtPrivateKey;
const jwtVerifyKey = jwtAlgorithm.toUpperCase().startsWith('HS') ? jwtSecret : jwtPublicKey;

export const config = {
  /** Environment name */
  env: NODE_ENV,
  isDevelopment,
  isProduction,
  npmPackageVersion: process.env.npm_package_version || '1.0.0',

  /** Server */
  port: parseInt(process.env.PORT || '5000', 10),
  apiPrefix: process.env.API_PREFIX || '/api',
  appName: process.env.APP_NAME || 'CRS',

  /** MongoDB */
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/crs',

  /** Local uploads directory (relative to server process cwd) */
  uploadDir: process.env.UPLOAD_DIR || 'uploads',

  /** Upload handling */
  uploadProvider: process.env.UPLOAD_PROVIDER === 's3' ? 's3' : 'local',
  maxUploadSizeMB: parseInt(process.env.MAX_UPLOAD_SIZE_MB || '10', 10),

  /** S3 (optional) */
  s3Bucket: process.env.S3_BUCKET || '',
  s3Region: process.env.S3_REGION || 'us-east-1',
  s3Endpoint: process.env.S3_ENDPOINT || '',
  s3AccessKeyId: process.env.S3_ACCESS_KEY_ID || '',
  s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  s3SignedUrlExpires: parseInt(process.env.S3_SIGNED_URL_EXPIRES || '3600', 10),

  /** SMTP */
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpFrom: process.env.SMTP_FROM || '',
  smtpVerifyTimeoutMs: parseInt(process.env.SMTP_VERIFY_TIMEOUT_MS || '10000', 10),
  smtpProbeCacheMs: parseInt(process.env.SMTP_PROBE_CACHE_MS || '60000', 10),
  smtpConnectionTimeoutMs: parseInt(process.env.SMTP_CONNECTION_TIMEOUT_MS || '10000', 10),
  smtpGreetingTimeoutMs: parseInt(process.env.SMTP_GREETING_TIMEOUT_MS || '10000', 10),
  smtpSocketTimeoutMs: parseInt(process.env.SMTP_SOCKET_TIMEOUT_MS || '10000', 10),
  smtpRequireTls: parseBool(process.env.SMTP_REQUIRE_TLS, false),
  smtpPool: parseBool(process.env.SMTP_POOL, false),
  smtpMaxConnections: parseInt(process.env.SMTP_MAX_CONNECTIONS || '5', 10),
  smtpMaxMessages: parseInt(process.env.SMTP_MAX_MESSAGES || '100', 10),

  /** Redis (optional - caching disabled if not set) */
  redisUrl: process.env.REDIS_URL || undefined,

  /** JWT */
  jwtAlgorithm,
  jwtPrivateKey,
  jwtPublicKey,
  jwtSecret,
  jwtSignKey,
  jwtVerifyKey,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  /** Auth cookies */
  authCookieName: process.env.AUTH_COOKIE_NAME || 'crs_token',
  authCookieMaxAgeMs: parseInt(process.env.AUTH_COOKIE_MAX_AGE_MS || `${7 * 24 * 60 * 60 * 1000}`, 10),
  cookieDomain: process.env.COOKIE_DOMAIN || undefined,
  cookieSecure,
  cookieSameSite,

  /** CSRF */
  csrfCookieName: process.env.CSRF_COOKIE_NAME || 'crs_csrf',
  csrfHeaderName: process.env.CSRF_HEADER_NAME || 'x-csrf-token',
  csrfTokenBytes: parseInt(process.env.CSRF_TOKEN_BYTES || '32', 10),

  /** CORS - comma-separated origins in production */
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),

  /** Rate limiting */
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  rateLimitAuthWindowMs: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS || '900000', 10),
  rateLimitAuthMax: parseInt(process.env.RATE_LIMIT_AUTH_MAX || '20', 10),

  /** Logging */
  logLevel: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  auditConsoleLogs: parseBool(process.env.AUDIT_CONSOLE_LOGS, isDevelopment),

  /** Library management - hidden fee waiver key */
  libraryFeeWaiverKey: process.env.LIBRARY_FEE_WAIVER_KEY || '',

  /** Landing page figures — alumni/faculty from DB; volumes & founding year configurable (not in DB) */
  landingLibraryVolumes: parseInt(process.env.LANDING_LIBRARY_VOLUMES || '8200', 10),
  landingFoundingYear: parseInt(process.env.LANDING_FOUNDING_YEAR || '1987', 10),
} as const;
