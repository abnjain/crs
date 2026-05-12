/**
 * ============================================================
 * Account Deletion Service - purge scheduled accounts
 * ============================================================
 */

import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Alumni } from '../models/Alumni.js';
import { Notification } from '../models/Notification.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { DocumentModel } from '../models/Document.js';
import { AuditLog } from '../models/AuditLog.js';
import { removeStoredFile } from './storage.service.js';
import { logger } from '../utils/logger.js';

export async function deleteUserData(userId: string, deleteDocuments: boolean): Promise<void> {
  const uid = new mongoose.Types.ObjectId(userId);

  const convs = await Conversation.find({ participants: uid }).select('_id').lean().exec();
  const convIds = convs.map((c) => c._id as mongoose.Types.ObjectId);
  if (convIds.length) {
    await Message.deleteMany({ conversation: { $in: convIds } }).exec();
    await Conversation.deleteMany({ _id: { $in: convIds } }).exec();
  }

  await Notification.deleteMany({ user: uid }).exec();
  await Alumni.deleteMany({ user: uid }).exec();

  if (deleteDocuments) {
    const docs = await DocumentModel.find({ owner: uid }).lean().exec();
    for (const doc of docs) {
      if (doc.storageProvider && doc.storageKey) {
        await removeStoredFile(doc.storageProvider, doc.storageKey).catch(() => undefined);
      }
    }
    await DocumentModel.deleteMany({ owner: uid }).exec();
  }

  await AuditLog.deleteMany({ $or: [{ actor: uid }, { targetId: uid }] }).exec();
  await User.deleteOne({ _id: uid }).exec();
}

export async function processScheduledAccountDeletions(): Promise<{ processed: number }> {
  const now = new Date();
  const users = await User.find({ deletionScheduledFor: { $lte: now } })
    .select('_id deletionDeleteDocuments')
    .lean()
    .exec();

  let processed = 0;
  for (const user of users) {
    try {
      await deleteUserData(user._id.toString(), Boolean(user.deletionDeleteDocuments));
      processed += 1;
    } catch (err) {
      logger.warn('Failed to delete user data:', err);
    }
  }

  return { processed };
}
