/**
 * ============================================================
 * Storage Service - local disk and S3 uploads
 * ============================================================
 */

import fs from 'fs/promises';
import path from 'path';
import type { Express } from 'express';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config/index.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';
import type { StorageProvider } from '../models/Document.js';

export interface StoredFile {
  storageProvider: StorageProvider;
  storageKey: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!config.s3Bucket) {
    throw new AppError('S3 bucket is not configured', 500);
  }
  if (!s3Client) {
    const credentials =
      config.s3AccessKeyId && config.s3SecretAccessKey
        ? { accessKeyId: config.s3AccessKeyId, secretAccessKey: config.s3SecretAccessKey }
        : undefined;

    s3Client = new S3Client({
      region: config.s3Region,
      endpoint: config.s3Endpoint || undefined,
      forcePathStyle: Boolean(config.s3Endpoint),
      credentials,
    });
  }
  return s3Client;
}

function sanitizeFileName(name: string): string {
  const cleaned = name.replace(/[^A-Za-z0-9._-]+/g, '_').replace(/_+/g, '_');
  return cleaned.length ? cleaned : 'document';
}

export function resolveStorageProvider(input?: string): StorageProvider {
  if (input === 's3') return 's3';
  if (input === 'local') return 'local';
  return config.uploadProvider;
}

export function resolveLocalPath(storageKey: string): string {
  return path.resolve(process.cwd(), config.uploadDir, storageKey);
}

export async function storeUploadedFile(params: {
  provider: StorageProvider;
  docId: string;
  file: Express.Multer.File;
}): Promise<StoredFile> {
  const safeName = sanitizeFileName(params.file.originalname || 'document');
  const key = path.posix.join('documents', params.docId, safeName);
  const meta: StoredFile = {
    storageProvider: params.provider,
    storageKey: key,
    fileName: params.file.originalname || safeName,
    mimeType: params.file.mimetype || 'application/octet-stream',
    sizeBytes: params.file.size ?? params.file.buffer?.length ?? 0,
  };

  if (params.provider === 's3') {
    const client = getS3Client();
    await client.send(
      new PutObjectCommand({
        Bucket: config.s3Bucket,
        Key: key,
        Body: params.file.buffer,
        ContentType: meta.mimeType,
      })
    );
    return meta;
  }

  const absPath = resolveLocalPath(key);
  await fs.mkdir(path.dirname(absPath), { recursive: true });
  await fs.writeFile(absPath, params.file.buffer);
  return meta;
}

export async function removeStoredFile(provider: StorageProvider, storageKey: string): Promise<void> {
  if (!storageKey) return;

  if (provider === 's3') {
    try {
      const client = getS3Client();
      await client.send(
        new DeleteObjectCommand({
          Bucket: config.s3Bucket,
          Key: storageKey,
        })
      );
    } catch (err) {
      logger.warn('Failed to delete S3 object', err as Error);
    }
    return;
  }

  try {
    const absPath = resolveLocalPath(storageKey);
    await fs.rm(absPath, { force: true });
    const folder = path.dirname(absPath);
    await fs.rm(folder, { recursive: true, force: true });
  } catch (err) {
    logger.warn('Failed to delete local file', err as Error);
  }
}

export async function getReadRedirectUrl(provider: StorageProvider, storageKey: string): Promise<string | null> {
  if (provider !== 's3') return null;
  const client = getS3Client();
  const command = new GetObjectCommand({
    Bucket: config.s3Bucket,
    Key: storageKey,
  });
  return getSignedUrl(client, command, { expiresIn: config.s3SignedUrlExpires });
}
