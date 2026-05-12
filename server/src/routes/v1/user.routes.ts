/**
 * ============================================================
 * User Routes - RBAC
 * GET /api/v1/users (admin only)
 * GET /api/v1/users/:id
 * ============================================================
 */

import { Router } from 'express';
import {
  getAllUsers,
  getUser,
  createUser,
  patchUserActive,
  reviewQueueUser,
  searchUsers,
  cancelUserDeletion,
} from '../../controllers/user.controller.js';
import { protect } from '../../middleware/auth.js';
import { restrictTo } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { adminCreateBodySchema } from '../../validators/auth.validator.js';
import { patchUserActiveBodySchema } from '../../validators/user.validator.js';
import { reviewQueueDecisionSchema } from '../../validators/reviewQueue.validator.js';

const router = Router();

router.get('/', protect, restrictTo('hod'), getAllUsers);
router.post('/', protect, restrictTo('admin'), validate(adminCreateBodySchema, 'body'), createUser);
router.get('/search', protect, searchUsers);
router.get('/:id', protect, getUser);
router.patch(
  '/:id/active',
  protect,
  restrictTo('admin'),
  validate(patchUserActiveBodySchema, 'body'),
  patchUserActive
);
router.patch(
  '/:id/review-queue',
  protect,
  restrictTo('admin'),
  validate(reviewQueueDecisionSchema, 'body'),
  reviewQueueUser
);

router.patch(
  '/:id/cancel-deletion',
  protect,
  restrictTo('admin'),
  // no body expected
  cancelUserDeletion
);

export default router;
