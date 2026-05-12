/**
 * ============================================================
 * Reports Routes - summary aggregates (HOD+, superadmin bypass)
 * ============================================================
 */

import { Router } from 'express';
import { getSummaryReport } from '../../controllers/reports.controller.js';
import { protect } from '../../middleware/auth.js';
import { restrictTo } from '../../middleware/rbac.js';

const router = Router();

router.get('/summary', protect, restrictTo('hod'), getSummaryReport);

export default router;
