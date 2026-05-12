/**
 * ============================================================
 * AuditLog Routes
 * ============================================================
 */

import { Router } from 'express';
import { getAuditLogs, getAuditLogStats } from '../../controllers/auditLog.controller.js';
import { protect } from '../../middleware/auth.js';
import { restrictTo } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { auditLogQuerySchema } from '../../validators/auditLog.validator.js';

const router = Router();

router.use(protect);
router.get('/', restrictTo('admin'), validate(auditLogQuerySchema, 'query'), getAuditLogs);
router.get('/stats', restrictTo('admin'), getAuditLogStats);

export default router;
