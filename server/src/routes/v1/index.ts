/**
 * ============================================================
 * API v1 Route Aggregator
 * Mounts all v1 route modules
 * ============================================================
 */

import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import alumniRoutes from './alumni.routes.js';
import eventRoutes from './event.routes.js';
import healthRoutes from './health.routes.js';
import auditLogRoutes from './auditLog.routes.js';
import siteConfigRoutes from './siteConfig.routes.js';
import reportsRoutes from './reports.routes.js';
import messagingRoutes from './messaging.routes.js';
import documentRoutes from './document.routes.js';
import publicRoutes from './public.routes.js';
import bookRoutes from './book.routes.js';
import bookCopyRoutes from './bookCopy.routes.js';
import borrowerRoutes from './borrower.routes.js';
import loanRoutes from './loan.routes.js';
import holdRoutes from './hold.routes.js';
import feeRoutes from './fee.routes.js';
import notificationRoutes from './notification.routes.js';
import { protect } from '../../middleware/auth.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/public', publicRoutes);
router.use('/auth', authRoutes);

router.use(protect);
router.use('/users', userRoutes);
router.use('/alumni', alumniRoutes);
router.use('/events', eventRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/site-config', siteConfigRoutes);
router.use('/reports', reportsRoutes);
router.use('/documents', documentRoutes);
router.use('/books', bookRoutes);
router.use('/book-copies', bookCopyRoutes);
router.use('/borrowers', borrowerRoutes);
router.use('/loans', loanRoutes);
router.use('/holds', holdRoutes);
router.use('/fees', feeRoutes);
router.use('/notifications', notificationRoutes);
router.use('/', messagingRoutes);

export default router;
