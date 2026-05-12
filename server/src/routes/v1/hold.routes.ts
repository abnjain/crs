/**
 * ============================================================
 * Hold Routes - RBAC (admin only)
 * ============================================================
 */

import { Router } from 'express';
import { getAllHolds, getHold, createHold, updateHold, deleteHold } from '../../controllers/hold.controller.js';
import { protect } from '../../middleware/auth.js';
import { restrictTo } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { createHoldSchema, updateHoldSchema } from '../../validators/hold.validator.js';

const router = Router();

router.use(protect, restrictTo('admin', 'superadmin'));

router.get('/', getAllHolds);
router.get('/:id', getHold);
router.post('/', validate(createHoldSchema, 'body'), createHold);
router.patch('/:id', validate(updateHoldSchema, 'body'), updateHold);
router.delete('/:id', deleteHold);

export default router;
