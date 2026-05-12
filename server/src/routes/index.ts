/**
 * ============================================================
 * Root Route Aggregator - API Versioning
 * /api/v1, /api/v2, ...
 * ============================================================
 */

import { Router } from 'express';
import v1Routes from './v1/index.js';

const router = Router();

router.use('/v1', v1Routes);

export default router;
