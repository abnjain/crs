/**
 * ============================================================
 * Book Routes - RBAC (admin only)
 * ============================================================
 */

import { Router } from 'express';
import {
  getAllBooks,
  getBook,
  getBookByIsbn,
  createBook,
  updateBook,
  deleteBook,
} from '../../controllers/book.controller.js';
import { protect } from '../../middleware/auth.js';
import { restrictTo } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { createBookSchema, updateBookSchema } from '../../validators/book.validator.js';

const router = Router();

router.use(protect, restrictTo('admin', 'superadmin'));

router.get('/', getAllBooks);
router.get('/by-isbn/:isbn', getBookByIsbn);
router.get('/:id', getBook);
router.post('/', validate(createBookSchema, 'body'), createBook);
router.patch('/:id', validate(updateBookSchema, 'body'), updateBook);
router.delete('/:id', deleteBook);

export default router;
