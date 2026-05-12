/**
 * ============================================================
 * Event Routes - RBAC
 * GET    /api/v1/events     (hod+ can list)
 * GET    /api/v1/events/:id (authenticated)
 * POST   /api/v1/events     (hod+)
 * PATCH  /api/v1/events/:id (hod+)
 * DELETE /api/v1/events/:id (admin+)
 * ============================================================
 */

import { Router } from 'express';
import { getAllEvents, getEvent, createEvent, updateEvent, deleteEvent, rsvpEvent, cancelRsvpEvent } from '../../controllers/event.controller.js';
import { protect } from '../../middleware/auth.js';
import { restrictTo } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { createEventSchema, updateEventSchema } from '../../validators/event.validator.js';

const router = Router();

router.use(protect);

router.get('/', getAllEvents);
router.get('/:id', getEvent);
router.post('/', restrictTo('hod'), validate(createEventSchema, 'body'), createEvent);
router.patch('/:id', restrictTo('hod'), validate(updateEventSchema, 'body'), updateEvent);
router.delete('/:id', restrictTo('admin'), deleteEvent);
router.post('/:id/rsvp', rsvpEvent);
router.delete('/:id/rsvp', cancelRsvpEvent);

export default router;
