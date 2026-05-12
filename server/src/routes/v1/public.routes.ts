/**
 * ============================================================
 * Public routes — no authentication
 * ============================================================
 */

import { Router } from 'express';
import { getLandingStats } from '../../controllers/public.controller.js';

const router = Router();

router.get('/landing-stats', getLandingStats);

export default router;
