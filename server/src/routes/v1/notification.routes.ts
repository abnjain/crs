/**
 * ============================================================
 * Notification Routes
 * ============================================================
 */

import { Router } from 'express';
import { protect } from '../../middleware/auth.js';
import { restrictTo } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import {
  listNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  broadcastNotification,
} from '../../controllers/notification.controller.js';
import { broadcastNotificationSchema } from '../../validators/notification.validator.js';

const router = Router();

router.use(protect);

router.get('/', listNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/:id/read', markNotificationRead);
router.post('/mark-all-read', markAllNotificationsRead);
router.post('/broadcast', restrictTo('admin', 'superadmin', 'hod'), validate(broadcastNotificationSchema, 'body'), broadcastNotification);

export default router;
