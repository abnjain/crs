/**
 * ============================================================
 * SiteConfig Routes - read admin+, update superadmin only
 * ============================================================
 */

import { Router } from 'express';
import { getConfig, updateConfig } from '../../controllers/siteConfig.controller.js';
import { protect } from '../../middleware/auth.js';
import { restrictTo } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { updateSiteConfigSchema } from '../../validators/siteConfig.validator.js';

const router = Router();

router.use(protect);
router.get('/', restrictTo('admin'), getConfig);
router.patch('/', restrictTo('superadmin'), validate(updateSiteConfigSchema, 'body'), updateConfig);

export default router;
