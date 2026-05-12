/**
 * ============================================================
 * Centralized Logger - API Hit Logs and Application Events
 * Colorful output: error, warn, info, http, debug
 * ============================================================
 */

import { config } from '../config/index.js';

const LOG_LEVELS: Record<string, number> = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const currentLevel = LOG_LEVELS[config.logLevel] ?? 2;

/** ANSI color codes */
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

const levelColors: Record<string, string> = {
  error: colors.red + colors.bold,
  warn: colors.yellow,
  info: colors.green,
  http: colors.cyan,
  debug: colors.gray,
};

function formatMessage(
  level: string,
  message: string,
  meta: Record<string, unknown> = {}
): string {
  const timestamp = new Date().toISOString();
  const color = levelColors[level] ?? colors.reset;
  const metaStr = Object.keys(meta).length ? ` ${colors.dim}${JSON.stringify(meta)}${colors.reset}` : '';
  return `${colors.dim}${timestamp}${colors.reset} ${color}[${level.toUpperCase()}]${colors.reset} ${message}${metaStr}`;
}

export const logger = {
  error: (message: string, ...args: unknown[]): void => {
    if (LOG_LEVELS.error <= currentLevel) {
      console.error(formatMessage('error', message), ...args);
    }
  },
  warn: (message: string, ...args: unknown[]): void => {
    if (LOG_LEVELS.warn <= currentLevel) {
      console.warn(formatMessage('warn', message), ...args);
    }
  },
  info: (message: string, ...args: unknown[]): void => {
    if (LOG_LEVELS.info <= currentLevel) {
      console.log(formatMessage('info', message), ...args);
    }
  },
  http: (message: string, meta: Record<string, unknown> = {}): void => {
    if (LOG_LEVELS.http <= currentLevel) {
      console.log(formatMessage('http', message, meta));
    }
  },
  debug: (message: string, ...args: unknown[]): void => {
    if (LOG_LEVELS.debug <= currentLevel) {
      console.debug(formatMessage('debug', message), ...args);
    }
  },
};
