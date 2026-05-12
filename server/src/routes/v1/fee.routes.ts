/**
 * ============================================================
 * Fee Routes - RBAC (admin only)
 * ============================================================
 */

import { Router } from 'express';
import {
  getAllFees,
  getFee,
  createFee,
  updateFee,
  waiveFee,
  deleteFee,
} from '../../controllers/fee.controller.js';
import { protect } from '../../middleware/auth.js';
import { restrictTo } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { createFeeSchema, updateFeeSchema, waiveFeeSchema } from '../../validators/fee.validator.js';

const router = Router();

router.use(protect, restrictTo('admin', 'superadmin'));

router.get('/', getAllFees);
router.get('/:id', getFee);
router.post('/', validate(createFeeSchema, 'body'), createFee);
router.patch('/:id', validate(updateFeeSchema, 'body'), updateFee);
router.patch('/:id/waive', validate(waiveFeeSchema, 'body'), waiveFee);
router.delete('/:id', deleteFee);

export default router;
