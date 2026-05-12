/**
 * ============================================================
 * Auth Routes
 * POST /api/v1/auth/register
 * POST /api/v1/auth/login
 * GET  /api/v1/auth/me (protected)
 * ============================================================
 */

import { Router } from 'express';
import {
	register,
	login,
	getCsrf,
	logout,
	getMe,
	updateMe,
	deleteMe,
	verifyEmail,
	requestEmailVerification,
} from '../../controllers/auth.controller.js';
import { protect } from '../../middleware/auth.js';
import { authRateLimiter } from '../../middleware/rateLimiter.js';
import { validate } from '../../middleware/validate.js';
import {
	registerBodySchema,
	loginBodySchema,
	updateMeBodySchema,
	deleteMeBodySchema,
	requestEmailVerificationBodySchema,
	verifyEmailBodySchema,
} from '../../validators/auth.validator.js';

const router = Router();

router.get('/csrf', getCsrf);
router.post('/register', authRateLimiter, validate(registerBodySchema, 'body'), register);
router.post('/login', authRateLimiter, validate(loginBodySchema, 'body'), login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.patch('/me', protect, validate(updateMeBodySchema, 'body'), updateMe);
router.post('/verify-email/request', protect, validate(requestEmailVerificationBodySchema, 'body'), requestEmailVerification);
router.post('/verify-email', protect, validate(verifyEmailBodySchema, 'body'), verifyEmail);
router.delete('/me', protect, validate(deleteMeBodySchema, 'body'), deleteMe);

export default router;
