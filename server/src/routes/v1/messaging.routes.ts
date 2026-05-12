/**
 * ============================================================
 * Messaging Routes - Conversations, messages, admin oversight
 * ============================================================
 */

import { Router } from 'express';
import { protect } from '../../middleware/auth.js';
import { restrictTo } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import {
  archiveConversationSchema,
  broadcastBodySchema,
  banMessagingSchema,
  createDirectConversationSchema,
  messagingOptInSchema,
  sendMessageBodySchema,
} from '../../validators/messaging.validator.js';
import * as messaging from '../../controllers/messaging.controller.js';
import * as messagingAdmin from '../../controllers/messagingAdmin.controller.js';

const router = Router();

router.use(protect);

router.patch('/messaging/me/opt-in', validate(messagingOptInSchema, 'body'), messaging.updateMessagingOptIn);

router.get('/conversations', messaging.listConversations);
router.post('/conversations', validate(createDirectConversationSchema, 'body'), messaging.createDirectConversation);
router.get('/conversations/:conversationId', messaging.getConversation);
router.post('/conversations/:conversationId/clear', messaging.clearConversation);
router.patch(
  '/conversations/:conversationId/archive',
  validate(archiveConversationSchema, 'body'),
  messaging.archiveConversation
);
router.patch('/conversations/:conversationId/read-all', messaging.markConversationRead);

router.get('/conversations/:conversationId/messages', messaging.listMessages);
router.get('/users/search', messaging.searchUsers);
router.post(
  '/conversations/:conversationId/messages',
  validate(sendMessageBodySchema, 'body'),
  messaging.sendMessage
);

router.patch('/messages/:messageId/read', messaging.markMessageRead);
router.delete('/messages/:messageId', messaging.deleteMessage);

const adminMessaging = Router();
adminMessaging.use(restrictTo('admin', 'hod'));
adminMessaging.get('/conversations', messagingAdmin.adminListConversations);
adminMessaging.get('/conversations/:conversationId/messages', messagingAdmin.adminGetConversationMessages);
adminMessaging.post('/broadcast', validate(broadcastBodySchema, 'body'), messagingAdmin.adminBroadcast);
adminMessaging.patch(
  '/users/:userId/ban',
  validate(banMessagingSchema, 'body'),
  messagingAdmin.adminBanMessaging
);
adminMessaging.get('/stats', messagingAdmin.adminMessagingStats);

router.use('/admin/messaging', adminMessaging);

export default router;
