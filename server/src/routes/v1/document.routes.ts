/**
 * ============================================================
 * Document Routes - RBAC
 * GET    /api/v1/documents          (faculty+)
 * GET    /api/v1/documents/:id      (faculty+)
 * GET    /api/v1/documents/:id/read (faculty+)
 * POST   /api/v1/documents          (faculty+)
 * PATCH  /api/v1/documents/:id      (owner only)
 * DELETE /api/v1/documents/:id      (admin+)
 * ============================================================
 */

import { Router } from 'express';
import {
  getAllDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  readDocument,
} from '../../controllers/document.controller.js';
import { protect } from '../../middleware/auth.js';
import { restrictTo } from '../../middleware/rbac.js';
import { upload } from '../../middleware/upload.js';

const router = Router();

router.use(protect);

router.get('/', restrictTo('faculty', 'hod', 'admin', 'superadmin', 'alumni'), getAllDocuments);
router.get('/:id', restrictTo('faculty', 'hod', 'admin', 'superadmin', 'alumni'), getDocument);
router.get('/:id/read', restrictTo('faculty', 'hod', 'admin', 'superadmin', 'alumni'), readDocument);
router.post('/', restrictTo('faculty', 'hod', 'admin', 'superadmin'), upload.single('file'), createDocument);
router.patch('/:id', restrictTo('faculty', 'hod', 'admin', 'superadmin'), upload.single('file'), updateDocument);
router.delete('/:id', restrictTo('admin', 'superadmin'), deleteDocument);

export default router;
