/**
 * ============================================================
 * Document Controller - upload, access, CRUD
 * ============================================================
 */

import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs/promises';
import { DocumentModel, type DocumentAudienceRole } from '../models/Document.js';
import { User } from '../models/User.js';
import type { UserRole } from '../models/User.js';
import { SiteConfig } from '../models/SiteConfig.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';
import { recordAuditEvent } from '../services/audit.service.js';
import {
  createNotificationsForUsers,
  resolveActiveUserIds,
  resolveUserIdsByRoles,
  serializeNotification,
} from '../services/notification.service.js';
import { emitNotification } from '../services/socket.service.js';
import {
  storeUploadedFile,
  removeStoredFile,
  resolveStorageProvider,
  getReadRedirectUrl,
  resolveLocalPath,
} from '../services/storage.service.js';
import { createDocumentSchema, updateDocumentSchema } from '../validators/document.validator.js';

function getParamId(req: Request): string {
  const raw = req.params.id;
  return Array.isArray(raw) ? (raw[0] ?? '') : (raw ?? '');
}

function parseBoolean(input: unknown): boolean | undefined {
  if (typeof input === 'boolean') return input;
  if (typeof input !== 'string') return undefined;
  const normalized = input.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  return undefined;
}

function parseStringArray(input: unknown): string[] {
  if (Array.isArray(input)) return input.map((v) => String(v).trim()).filter(Boolean);
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((v) => String(v).trim()).filter(Boolean);
      }
    } catch {
      // fall through to comma split
    }
    return trimmed
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

function getUserRoles(req: Request): string[] {
  const user = req.user;
  if (!user) return [];
  return user.getEffectiveRoles?.() ?? (user.roles?.length ? user.roles : [user.role]);
}

function isAdmin(req: Request): boolean {
  const roles = getUserRoles(req);
  return roles.includes('admin') || roles.includes('superadmin');
}

function isOwner(req: Request, ownerId: mongoose.Types.ObjectId): boolean {
  return String(req.user?._id ?? '') === String(ownerId);
}

function canReadDocument(req: Request, doc: { owner: mongoose.Types.ObjectId; visibility: string; shareAll: boolean; audienceRoles: DocumentAudienceRole[]; audienceUsers: mongoose.Types.ObjectId[]; }): boolean {
  if (!req.user) return false;
  if (isAdmin(req) || isOwner(req, doc.owner)) return true;
  if (doc.visibility === 'private') return false;
  if (doc.shareAll) return true;

  const roles = getUserRoles(req);
  if (doc.audienceRoles?.some((r) => roles.includes(r))) return true;
  if (doc.audienceUsers?.some((id) => String(id) === String(req.user?._id))) return true;

  return false;
}

async function resolveAudienceUsers(emails: string[], ids: string[]): Promise<mongoose.Types.ObjectId[]> {
  const uniqueIds = new Set<string>();
  const normalizedEmails = emails
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  for (const id of ids) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid audience user ID', 400);
    }
    uniqueIds.add(id);
  }

  if (normalizedEmails.length > 0) {
    const users = await User.find({ email: { $in: normalizedEmails } })
      .select('_id email')
      .exec();
    const foundEmails = new Set(users.map((u) => u.email.toLowerCase()));
    const missing = normalizedEmails.filter((email) => !foundEmails.has(email));
    if (missing.length > 0) {
      throw new AppError(`Audience users not found: ${missing.join(', ')}`, 400);
    }
    users.forEach((u) => uniqueIds.add(String(u._id)));
  }

  return Array.from(uniqueIds).map((id) => new mongoose.Types.ObjectId(id));
}

function normalizeAudienceDefaults(params: {
  visibility: 'private' | 'shared';
  shareAll: boolean;
  audienceRoles: DocumentAudienceRole[];
  audienceUsers: mongoose.Types.ObjectId[];
}): {
  visibility: 'private' | 'shared';
  shareAll: boolean;
  audienceRoles: DocumentAudienceRole[];
  audienceUsers: mongoose.Types.ObjectId[];
} {
  if (params.visibility === 'private') {
    return {
      visibility: 'private',
      shareAll: false,
      audienceRoles: [],
      audienceUsers: [],
    };
  }

  if (params.shareAll) {
    return {
      visibility: 'shared',
      shareAll: true,
      audienceRoles: [],
      audienceUsers: params.audienceUsers,
    };
  }

  if (params.audienceRoles.length === 0 && params.audienceUsers.length === 0) {
    return {
      visibility: 'shared',
      shareAll: false,
      audienceRoles: ['faculty'],
      audienceUsers: [],
    };
  }

  return { ...params, visibility: 'shared' };
}

export async function getAllDocuments(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const roles = getUserRoles(req);
    const userId = req.user?._id;

    let query = DocumentModel.find();

    if (!isAdmin(req)) {
      if (!userId) throw new AppError('Not authorized', 401);
      query = query.where({
        $or: [
          { owner: userId },
          { visibility: 'shared', shareAll: true },
          { visibility: 'shared', audienceRoles: { $in: roles } },
          { visibility: 'shared', audienceUsers: userId },
        ],
      });
    }

    const documents = await query
      .populate('owner', 'name email')
      .populate('audienceUsers', 'name email')
      .sort('-createdAt')
      .exec();

    res.json({ success: true, count: documents.length, documents });
  } catch (err) {
    next(err);
  }
}

export async function getDocument(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = getParamId(req);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid ID format', 400);
    }

    const document = await DocumentModel.findById(id)
      .populate('owner', 'name email')
      .populate('audienceUsers', 'name email');

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    if (!canReadDocument(req, document)) {
      throw new AppError('Access denied', 403);
    }

    res.json({ success: true, document });
  } catch (err) {
    next(err);
  }
}

export async function createDocument(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError('Not authorized', 401);

    const file = req.file;
    if (!file) {
      throw new AppError('File is required', 400);
    }

    const siteConfig = await SiteConfig.getConfig();
    const maxBytes = siteConfig.maxUploadSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new AppError(`File exceeds ${siteConfig.maxUploadSizeMB} MB limit`, 400);
    }

    const raw = req.body ?? {};
    const audienceRoles = parseStringArray(raw.audienceRoles) as DocumentAudienceRole[];
    const audienceEmails = parseStringArray(raw.audienceEmails);
    const audienceUserIds = parseStringArray(raw.audienceUsers);

    const parsed = createDocumentSchema.parse({
      title: raw.title,
      description: raw.description,
      kind: raw.kind,
      visibility: raw.visibility,
      shareAll: parseBoolean(raw.shareAll),
      audienceRoles,
      audienceUsers: [],
      storageProvider: raw.storageProvider,
    });

    const audienceUsers = await resolveAudienceUsers(audienceEmails, audienceUserIds);
    const normalizedAudience = normalizeAudienceDefaults({
      visibility: parsed.visibility,
      shareAll: parsed.shareAll,
      audienceRoles: parsed.audienceRoles,
      audienceUsers,
    });

    const docId = new mongoose.Types.ObjectId();
    const provider = resolveStorageProvider(parsed.storageProvider);
    const stored = await storeUploadedFile({
      provider,
      docId: String(docId),
      file,
    });

    const document = await DocumentModel.create({
      _id: docId,
      title: parsed.title,
      description: parsed.description,
      kind: parsed.kind,
      owner: req.user._id,
      visibility: normalizedAudience.visibility,
      shareAll: normalizedAudience.shareAll,
      audienceRoles: normalizedAudience.audienceRoles,
      audienceUsers: normalizedAudience.audienceUsers,
      storageProvider: stored.storageProvider,
      storageKey: stored.storageKey,
      fileName: stored.fileName,
      mimeType: stored.mimeType,
      sizeBytes: stored.sizeBytes,
    });

    recordAuditEvent({
      category: 'document',
      action: 'document.created',
      req,
      statusCode: 201,
      targetModel: 'Document',
      targetId: document._id,
      details: {
        title: document.title,
        kind: document.kind,
        visibility: document.visibility,
      },
    });

    let recipients: mongoose.Types.ObjectId[] = [];
    if (document.visibility !== 'private') {
      if (document.shareAll) {
        recipients = await resolveActiveUserIds();
      } else if (document.audienceUsers?.length) {
        recipients = document.audienceUsers as mongoose.Types.ObjectId[];
      } else if (document.audienceRoles?.length) {
        recipients = await resolveUserIdsByRoles(document.audienceRoles as UserRole[]);
      }
    }

    const ownerId = req.user?._id?.toString();
    const filtered = ownerId
      ? recipients.filter((id) => id.toString() !== ownerId)
      : recipients;

    if (filtered.length) {
      const created = await createNotificationsForUsers(filtered, {
        title: 'New document available',
        message: document.title,
        type: 'document',
        link: '/dashboard/documents',
        actorId: req.user?._id,
        sourceModel: 'Document',
        sourceId: document._id,
        data: { documentId: document._id.toString(), title: document.title },
      });

      created.forEach((doc) => {
        emitNotification(doc.user.toString(), serializeNotification(doc));
      });
    }

    res.status(201).json({ success: true, document });
  } catch (err) {
    next(err);
  }
}

export async function updateDocument(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = getParamId(req);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid ID format', 400);
    }

    const document = await DocumentModel.findById(id);
    if (!document) {
      throw new AppError('Document not found', 404);
    }

    if (!isOwner(req, document.owner)) {
      throw new AppError('Only the owner can update this document', 403);
    }

    const raw = req.body ?? {};
    const candidate: Record<string, unknown> = {};
    if ('title' in raw) candidate.title = raw.title;
    if ('description' in raw) candidate.description = raw.description;
    if ('kind' in raw) candidate.kind = raw.kind;
    if ('visibility' in raw) candidate.visibility = raw.visibility;
    if ('shareAll' in raw) candidate.shareAll = parseBoolean(raw.shareAll);
    if ('audienceRoles' in raw) candidate.audienceRoles = parseStringArray(raw.audienceRoles);
    if ('storageProvider' in raw) candidate.storageProvider = raw.storageProvider;

    const parsed = updateDocumentSchema.parse(candidate);

    const updates: Record<string, unknown> = {};
    if (parsed.title !== undefined) updates.title = parsed.title;
    if ('description' in candidate) updates.description = parsed.description || '';
    if (parsed.kind !== undefined) updates.kind = parsed.kind;

    const accessChange =
      'visibility' in candidate ||
      'shareAll' in candidate ||
      'audienceRoles' in candidate ||
      'audienceUsers' in raw ||
      'audienceEmails' in raw;

    if (accessChange) {
      const audienceRoles = (parsed.audienceRoles ?? document.audienceRoles) as DocumentAudienceRole[];
      const audienceEmails = parseStringArray(raw.audienceEmails);
      const audienceUserIds = parseStringArray(raw.audienceUsers);
      const audienceUsers =
        audienceEmails.length > 0 || audienceUserIds.length > 0
          ? await resolveAudienceUsers(audienceEmails, audienceUserIds)
          : document.audienceUsers;

      const normalizedAudience = normalizeAudienceDefaults({
        visibility: (parsed.visibility ?? document.visibility) as 'private' | 'shared',
        shareAll: parsed.shareAll ?? document.shareAll,
        audienceRoles,
        audienceUsers,
      });

      updates.visibility = normalizedAudience.visibility;
      updates.shareAll = normalizedAudience.shareAll;
      updates.audienceRoles = normalizedAudience.audienceRoles;
      updates.audienceUsers = normalizedAudience.audienceUsers;
    }

    const file = req.file;
    if (file) {
      const siteConfig = await SiteConfig.getConfig();
      const maxBytes = siteConfig.maxUploadSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        throw new AppError(`File exceeds ${siteConfig.maxUploadSizeMB} MB limit`, 400);
      }

      const provider = resolveStorageProvider((parsed.storageProvider as string) ?? document.storageProvider);
      const stored = await storeUploadedFile({
        provider,
        docId: String(document._id),
        file,
      });

      updates.storageProvider = stored.storageProvider;
      updates.storageKey = stored.storageKey;
      updates.fileName = stored.fileName;
      updates.mimeType = stored.mimeType;
      updates.sizeBytes = stored.sizeBytes;

      await removeStoredFile(document.storageProvider, document.storageKey);
    }

    Object.assign(document, updates);
    await document.save();

    recordAuditEvent({
      category: 'document',
      action: 'document.updated',
      req,
      statusCode: 200,
      targetModel: 'Document',
      targetId: document._id,
      details: { changes: updates },
    });

    res.json({ success: true, document });
  } catch (err) {
    next(err);
  }
}

export async function deleteDocument(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = getParamId(req);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid ID format', 400);
    }

    const document = await DocumentModel.findById(id);
    if (!document) {
      throw new AppError('Document not found', 404);
    }

    if (!isAdmin(req)) {
      throw new AppError('Only admins can delete this document', 403);
    }

    await DocumentModel.deleteOne({ _id: document._id });
    await removeStoredFile(document.storageProvider, document.storageKey);

    recordAuditEvent({
      category: 'document',
      action: 'document.deleted',
      req,
      statusCode: 200,
      targetModel: 'Document',
      targetId: document._id,
      details: {
        title: document.title,
        kind: document.kind,
      },
    });

    res.json({ success: true, message: 'Document deleted' });
  } catch (err) {
    next(err);
  }
}

export async function readDocument(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = getParamId(req);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid ID format', 400);
    }

    const document = await DocumentModel.findById(id);
    if (!document) {
      throw new AppError('Document not found', 404);
    }

    if (!canReadDocument(req, document)) {
      throw new AppError('Access denied', 403);
    }

    if (document.storageProvider === 's3') {
      const url = await getReadRedirectUrl('s3', document.storageKey);
      if (!url) {
        throw new AppError('S3 read URL unavailable', 500);
      }
      res.redirect(url);
      return;
    }

    const absPath = resolveLocalPath(document.storageKey);
    try {
      await fs.access(absPath);
    } catch {
      throw new AppError('File not found on disk', 404);
    }

    const fileName = path.basename(document.fileName || 'document');
    const isPdf = document.mimeType === 'application/pdf';
    res.setHeader('Content-Type', document.mimeType || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `${isPdf ? 'inline' : 'attachment'}; filename="${fileName}"`
    );
    res.sendFile(absPath);
  } catch (err) {
    next(err);
  }
}
