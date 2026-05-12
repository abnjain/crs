/**
 * ============================================================
 * Alumni Routes - RBAC
 * GET    /api/v1/alumni     (hod+ can list)
 * GET    /api/v1/alumni/:id (authenticated)
 * POST   /api/v1/alumni     (admin+)
 * PATCH  /api/v1/alumni/:id (admin+)
 * DELETE /api/v1/alumni/:id (admin+)
 * ============================================================
 */

import { Router } from 'express';
import {
  getAllAlumni,
  getAlumni,
  getAlumniByUser,
  createAlumni,
  updateAlumni,
  deleteAlumni,
  reviewQueueAlumni,
  upsertMyAlumniProfile,
} from '../../controllers/alumni.controller.js';
import { protect } from '../../middleware/auth.js';
import { restrictTo } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { createAlumniSchema, updateAlumniSchema, selfAlumniUpsertSchema } from '../../validators/alumni.validator.js';
import { reviewQueueDecisionSchema } from '../../validators/reviewQueue.validator.js';

const router = Router();

router.use(protect);

router.get('/by-user/:userId', getAlumniByUser);
router.patch('/me', restrictTo('alumni'), validate(selfAlumniUpsertSchema, 'body'), upsertMyAlumniProfile);
router.get('/', restrictTo('hod'), getAllAlumni);
router.get('/:id', getAlumni);
router.post('/', restrictTo('admin'), validate(createAlumniSchema, 'body'), createAlumni);
router.patch(
  '/:id/review-queue',
  restrictTo('admin'),
  validate(reviewQueueDecisionSchema, 'body'),
  reviewQueueAlumni
);
router.patch('/:id', restrictTo('admin'), validate(updateAlumniSchema, 'body'), updateAlumni);
router.delete('/:id', restrictTo('admin'), deleteAlumni);

export default router;
