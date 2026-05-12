/**
 * ============================================================
 * Upload Middleware (Multer)
 * ============================================================
 */

import multer from 'multer';
import { config } from '../config/index.js';

const maxBytes = config.maxUploadSizeMB * 1024 * 1024;

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxBytes,
  },
});
