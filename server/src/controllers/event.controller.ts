/**
 * ============================================================
 * Event Controller - MVC
 * CRUD operations for institutional events
 * ============================================================
 */

import { Request, Response, NextFunction } from 'express';
import { Event } from '../models/Event.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';
import mongoose from 'mongoose';
import { recordAuditEvent } from '../services/audit.service.js';
import { createNotificationsForUsers, resolveActiveUserIds, serializeNotification } from '../services/notification.service.js';
import { emitNotification } from '../services/socket.service.js';

function getParamId(req: Request): string {
  const raw = req.params.id;
  return Array.isArray(raw) ? (raw[0] ?? '') : (raw ?? '');
}

export async function getAllEvents(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    logger.debug('getAllEvents called');
    const events = await Event.find()
      .populate('organizer', 'name email')
      .sort('-date');
    logger.info(`getAllEvents: returned ${events.length} events`);
    res.json({ success: true, count: events.length, events });
  } catch (err) {
    next(err);
  }
}

export async function getEvent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = getParamId(req);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid ID format', 400);
    }
    const event = await Event.findById(id).populate('organizer', 'name email');
    if (!event) {
      throw new AppError('Event not found', 404);
    }
    res.json({ success: true, event });
  } catch (err) {
    next(err);
  }
}

export async function createEvent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = { ...req.body, organizer: req.user!._id };
    logger.debug(`createEvent: title=${body.title}`);

    const event = await Event.create(body);
    logger.info(`Created event: ${event._id} - ${event.title}`);

    recordAuditEvent({
      category: 'event',
      action: 'event.created',
      req,
      statusCode: 201,
      targetModel: 'Event',
      targetId: event._id,
      details: {
        title: event.title,
        type: event.type,
        date: event.date,
        status: event.status,
      },
    });

    const recipients = await resolveActiveUserIds();
    const creatorId = req.user?._id?.toString();
    const filtered = creatorId
      ? recipients.filter((id) => id.toString() !== creatorId)
      : recipients;
    const dateLabel = event.date ? new Date(event.date).toISOString().slice(0, 10) : '';
    const created = await createNotificationsForUsers(filtered, {
      title: 'New event scheduled',
      message: dateLabel ? `${event.title} on ${dateLabel}` : event.title,
      type: 'event',
      link: '/events',
      actorId: req.user?._id,
      sourceModel: 'Event',
      sourceId: event._id,
      data: { eventId: event._id.toString(), date: event.date },
    });

    created.forEach((doc) => {
      emitNotification(doc.user.toString(), serializeNotification(doc));
    });

    res.status(201).json({ success: true, event });
  } catch (err) {
    next(err);
  }
}

export async function updateEvent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = getParamId(req);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid ID format', 400);
    }

    const event = await Event.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate('organizer', 'name email');

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    logger.info(`Updated event: ${event._id}`);
    recordAuditEvent({
      category: 'event',
      action: 'event.updated',
      req,
      statusCode: 200,
      targetModel: 'Event',
      targetId: event._id,
      details: { changes: req.body, title: event.title },
    });
    res.json({ success: true, event });
  } catch (err) {
    next(err);
  }
}

export async function deleteEvent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = getParamId(req);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid ID format', 400);
    }

    const event = await Event.findByIdAndDelete(id);
    if (!event) {
      throw new AppError('Event not found', 404);
    }

    logger.info(`Deleted event: ${id}`);
    recordAuditEvent({
      category: 'event',
      action: 'event.deleted',
      req,
      statusCode: 200,
      targetModel: 'Event',
      targetId: event._id,
      details: {
        title: event.title,
        date: event.date,
        status: event.status,
      },
    });
    res.json({ success: true, message: 'Event deleted' });
  } catch (err) {
    next(err);
  }
}

export async function rsvpEvent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = getParamId(req);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid ID format', 400);
    }
    const userId = req.user!._id;
    const event = await Event.findById(id);
    if (!event) {
      throw new AppError('Event not found', 404);
    }
    if (!event.rsvpEnabled) {
      throw new AppError('RSVP is disabled for this event', 400);
    }
    if (event.attendees.map((a) => a.toString()).includes(userId.toString())) {
      res.json({ success: true, message: 'Already RSVPd', rsvped: true });
      return;
    }
    event.attendees.push(userId);
    await event.save();
    logger.info(`RSVP: user ${userId} -> event ${id}`);
    res.json({
      success: true,
      message: 'RSVP confirmed',
      rsvped: true,
      attendeeCount: event.attendees.length,
    });
  } catch (err) {
    next(err);
  }
}

export async function cancelRsvpEvent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = getParamId(req);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid ID format', 400);
    }
    const userId = req.user!._id;
    const event = await Event.findById(id);
    if (!event) {
      throw new AppError('Event not found', 404);
    }
    event.attendees = event.attendees.filter((a) => a.toString() !== userId.toString());
    await event.save();
    logger.info(`RSVP cancelled: user ${userId} -> event ${id}`);
    res.json({
      success: true,
      message: 'RSVP cancelled',
      rsvped: false,
      attendeeCount: event.attendees.length,
    });
  } catch (err) {
    next(err);
  }
}
