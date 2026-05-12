/**
 * ============================================================
 * Redis Caching Service
 * Wraps ioredis for get/set/delete operations
 * Gracefully degrades when Redis is unavailable
 * ============================================================
 */

import { Redis } from 'ioredis';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

let redis: Redis | null = null;
let isConnected = false;

/**
 * Initialize Redis connection if REDIS_URL is set
 */
export async function initRedis(): Promise<void> {
  if (!config.redisUrl) {
    logger.info('Redis not configured - caching disabled');
    return;
  }

  try {
    redis = new Redis(config.redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => (times > 3 ? null : Math.min(times * 100, 3000)),
    });

    redis.on('connect', () => {
      isConnected = true;
      logger.info('Redis connected');
    });

    redis.on('error', (err: Error) => {
      logger.error('Redis error:', err);
    });

    redis.on('close', () => {
      isConnected = false;
    });

    await redis.ping();
  } catch (err) {
    logger.warn('Redis connection failed - caching disabled:', err);
    redis = null;
  }
}

/**
 * Get value from cache
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis || !isConnected) return null;

  try {
    const value = await redis.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

/**
 * Set value in cache with optional TTL (seconds)
 */
export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds?: number
): Promise<boolean> {
  if (!redis || !isConnected) return false;

  try {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await redis.setex(key, ttlSeconds, serialized);
    } else {
      await redis.set(key, serialized);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Delete key from cache
 */
export async function cacheDel(key: string): Promise<boolean> {
  if (!redis || !isConnected) return false;

  try {
    await redis.del(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Close Redis connection gracefully
 */
export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
    isConnected = false;
    logger.info('Redis connection closed');
  }
}

/** Check if Redis is available */
export function isRedisAvailable(): boolean {
  return redis !== null && isConnected;
}

/** Round-trip PING latency in ms, or null if unavailable */
export async function measureRedisPingMs(): Promise<number | null> {
  if (!redis || !isConnected) return null;
  const t0 = Date.now();
  try {
    await redis.ping();
    return Date.now() - t0;
  } catch {
    return null;
  }
}

/**
 * Parse used_memory and maxmemory from Redis INFO (bytes).
 * When maxmemory is 0, Redis has no enforced cap — returns percent null.
 */
export async function getRedisMemoryDiagnostic(): Promise<{
  usedPercent: number | null;
  note: string;
}> {
  if (!redis || !isConnected) {
    return { usedPercent: null, note: '' };
  }
  try {
    const raw = await redis.info('memory');
    let usedBytes = 0;
    let maxBytes = 0;
    for (const line of raw.split(/\r?\n/)) {
      if (line.startsWith('used_memory:')) {
        usedBytes = parseInt(line.split(':')[1]?.trim() ?? '0', 10) || 0;
      } else if (line.startsWith('maxmemory:')) {
        maxBytes = parseInt(line.split(':')[1]?.trim() ?? '0', 10) || 0;
      }
    }
    const mb = (n: number) => (n / (1024 * 1024)).toFixed(1);
    if (maxBytes > 0) {
      const pct = Math.round((usedBytes / maxBytes) * 100);
      return { usedPercent: pct, note: `${pct}% of max (${mb(usedBytes)} MB)` };
    }
    return {
      usedPercent: null,
      note: `${mb(usedBytes)} MB used`,
    };
  } catch {
    return { usedPercent: null, note: '' };
  }
}
