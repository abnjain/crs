/**
 * ============================================================
 * Loan Routes - RBAC (admin only)
 * ============================================================
 */

import { Router } from 'express';
import {
  getAllLoans,
  getLoan,
  createLoan,
  renewLoan,
  returnLoan,
  deleteLoan,
} from '../../controllers/loan.controller.js';
import { protect } from '../../middleware/auth.js';
import { restrictTo } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { createLoanSchema, renewLoanSchema, returnLoanSchema } from '../../validators/loan.validator.js';

const router = Router();

router.use(protect, restrictTo('admin', 'superadmin'));

router.get('/', getAllLoans);
router.get('/:id', getLoan);
router.post('/', validate(createLoanSchema, 'body'), createLoan);
router.patch('/:id/renew', validate(renewLoanSchema, 'body'), renewLoan);
router.patch('/:id/return', validate(returnLoanSchema, 'body'), returnLoan);
router.delete('/:id', deleteLoan);

export default router;
