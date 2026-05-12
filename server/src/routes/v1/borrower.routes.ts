/**
 * ============================================================
 * Borrower Routes - RBAC (admin only)
 * ============================================================
 */

import { Router } from 'express';
import {
  getAllBorrowers,
  getBorrower,
  getBorrowerByStudentId,
  createBorrower,
  updateBorrower,
  deleteBorrower,
} from '../../controllers/borrower.controller.js';
import { protect } from '../../middleware/auth.js';
import { restrictTo } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { createBorrowerSchema, updateBorrowerSchema } from '../../validators/borrower.validator.js';

const router = Router();

router.use(protect, restrictTo('admin', 'superadmin'));

router.get('/', getAllBorrowers);
router.get('/by-student/:studentId', getBorrowerByStudentId);
router.get('/:id', getBorrower);
router.post('/', validate(createBorrowerSchema, 'body'), createBorrower);
router.patch('/:id', validate(updateBorrowerSchema, 'body'), updateBorrower);
router.delete('/:id', deleteBorrower);

export default router;
