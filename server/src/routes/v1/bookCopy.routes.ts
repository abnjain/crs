/**
 * ============================================================
 * BookCopy Routes - RBAC (admin only)
 * ============================================================
 */

import { Router } from 'express';
import {
  getAllBookCopies,
  getBookCopy,
  createBookCopy,
  updateBookCopy,
  deleteBookCopy,
} from '../../controllers/bookCopy.controller.js';
import { protect } from '../../middleware/auth.js';
import { restrictTo } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { createBookCopySchema, updateBookCopySchema } from '../../validators/bookCopy.validator.js';

const router = Router();

router.use(protect, restrictTo('admin', 'superadmin'));

router.get('/', getAllBookCopies);
router.get('/:id', getBookCopy);
router.post('/', validate(createBookCopySchema, 'body'), createBookCopy);
router.patch('/:id', validate(updateBookCopySchema, 'body'), updateBookCopy);
router.delete('/:id', deleteBookCopy);

export default router;
