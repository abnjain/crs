/**
 * ============================================================
 * Health Controller
 * Overall system health with live measurements:
 * - MongoDB ping latency
 * - Redis ping + memory usage (when configured)
 * - Node process memory & uptime
 * - SMTP reachability (when configured)
 * - Disk volume for upload directory
 * ============================================================
 */

import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { mkdir, statfs } from 'node:fs/promises';
import { config } from '../config/index.js';
import {
  getRedisMemoryDiagnostic,
  isRedisAvailable,
  measureRedisPingMs,
} from '../services/redis.service.js';
import { probeMail } from '../services/mail.service.js';
import { logger } from '../utils/logger.js';
import { normalizeClientIp } from '../utils/clientIp.js';
import { getOptionalAuthEmail } from '../middleware/auth.js';

const startTime = Date.now();

export function getLiveHealth(req: Request, res: Response): void {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.json({
    success: true,
    status: 'live',
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: uptimeSeconds,
      formatted: formatUptime(uptimeSeconds),
    },
    version: config.npmPackageVersion,
  });
}

export function getReadyHealth(req: Request, res: Response): void {
  const mongoReady = mongoose.connection.readyState === 1;
  const redisReady = config.redisUrl ? isRedisAvailable() : true;
  const ready = mongoReady && redisReady;

  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.status(ready ? 200 : 503).json({
    success: ready,
    status: ready ? 'ready' : 'not-ready',
    timestamp: new Date().toISOString(),
    services: {
      mongodb: mongoReady ? 'connected' : 'disconnected',
      redis: config.redisUrl ? (redisReady ? 'connected' : 'disconnected') : 'disabled',
    },
    version: config.npmPackageVersion,
  });
}

function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n < 0) return '—';
  if (n < 1024) return `${Math.round(n)} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let v = n;
  let i = -1;
  do {
    v /= 1024;
    i++;
  } while (v >= 1024 && i < units.length - 1);
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

async function pingMongoMs(): Promise<number | null> {
  if (mongoose.connection.readyState !== 1) return null;
  const db = mongoose.connection.db;
  if (!db) return null;
  const t0 = Date.now();
  try {
    await db.admin().command({ ping: 1 });
    return Date.now() - t0;
  } catch {
    return null;
  }
}

async function getUploadVolumeUsage(): Promise<{
  usedBytes: number;
  totalBytes: number;
} | null> {
  const root = path.resolve(process.cwd(), config.uploadDir);
  try {
    await mkdir(root, { recursive: true });
    const s = await statfs(root);
    const bsize = Number(s.bsize);
    const blocks = Number(s.blocks);
    const avail = Number(s.bavail ?? s.bfree);
    const total = blocks * bsize;
    const free = avail * bsize;
    const used = total - free;
    return { usedBytes: used, totalBytes: total };
  } catch {
    return null;
  }
}

export async function getHealth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const handlerStarted = Date.now();
  try {
    const memUsage = process.memoryUsage();
    const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

    const mongodbStatus =
      mongoose.connection.readyState === 1
        ? 'connected'
        : mongoose.connection.readyState === 2
          ? 'connecting'
          : 'disconnected';
    const redisStatus = config.redisUrl
      ? isRedisAvailable()
        ? 'connected'
        : 'disconnected'
      : 'disabled';

    const heapUsed = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotal = Math.round(memUsage.heapTotal / 1024 / 1024);
    const heapPct = heapTotal > 0 ? Math.round((heapUsed / heapTotal) * 100) : null;

    const [mongodbLatencyMs, redisLatencyMs, redisMem, smtp, volume] = await Promise.all([
      pingMongoMs(),
      measureRedisPingMs(),
      getRedisMemoryDiagnostic(),
      probeMail(),
      getUploadVolumeUsage(),
    ]);

    const health = {
      success: true,
      status: mongodbStatus === 'connected' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: uptimeSeconds,
        formatted: formatUptime(uptimeSeconds),
      },
      memory: {
        heapUsed,
        heapTotal,
        rss: Math.round(memUsage.rss / 1024 / 1024),
        unit: 'MB',
      },
      services: {
        mongodb: mongodbStatus,
        mongodbDatabase: mongoose.connection.db?.databaseName ?? null,
        redis: redisStatus,
        mail: smtp.configured
          ? { status: smtp.ok ? 'connected' : 'error', detail: smtp.detail }
          : { status: 'disabled', detail: null },
      },
      /** Richer telemetry for dashboards */
      diagnostics: {
        mongodbLatencyMs,
        redisLatencyMs,
        redisMemoryPercent: redisMem.usedPercent,
        redisMemoryNote: redisMem.note || null,
        nodeHeapPercent: heapPct,
        probeDurationMs: Date.now() - handlerStarted,
        smtp,
        storage: volume
          ? {
              usedBytes: volume.usedBytes,
              totalBytes: volume.totalBytes,
              usedLabel: formatBytes(volume.usedBytes),
              totalLabel: formatBytes(volume.totalBytes),
            }
          : null,
      },
      version: config.npmPackageVersion,
    };

    const ip = normalizeClientIp(req);
    const userEmail = await getOptionalAuthEmail(req);
    logger.http(`Health check · ip=${ip}${userEmail ? ` · user=${userEmail}` : ''}`, {
      status: health.status,
      ip,
      ...(userEmail ? { userEmail } : {}),
    });
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.json(health);
  } catch (err) {
    next(err);
  }
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0) parts.push(`${mins}m`);
  parts.push(`${secs}s`);
  return parts.join(' ');
}
