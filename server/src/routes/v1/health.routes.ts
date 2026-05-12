/**
 * ============================================================
 * Health Check Routes
 * GET /api/v1/health - Overall system health with measurements
 * ============================================================
 */

import { Router } from 'express';
import {
	getHealth,
	getLiveHealth,
	getReadyHealth,
} from '../../controllers/health.controller.js';

const router = Router();

router.get('/live', getLiveHealth);
router.get('/ready', getReadyHealth);
router.get('/', getHealth);

export default router;
