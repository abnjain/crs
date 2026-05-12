/**
 * ============================================================
 * Event Model - Institutional events (seminars, workshops, etc.)
 * Organizer links to User model via ObjectId reference
 * ============================================================
 */

import mongoose, { Document, Model, Schema } from 'mongoose';

export type EventType = 'seminar' | 'workshop' | 'reunion' | 'webinar' | 'conference' | 'other';
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface IEvent extends Document {
  title: string;
  description: string;
  type: EventType;
  date: Date;
  endDate: Date;
  location: string;
  isOnline: boolean;
  meetLink: string;
  organizer: mongoose.Types.ObjectId;
  status: EventStatus;
  maxAttendees: number;
  tags: string[];
  /** Image URLs — https URL or root-relative path (e.g. /uploads/events/…) */
  photos: string[];
  /** Whether attendees can RSVP */
  rsvpEnabled: boolean;
  /** User IDs who have RSVP'd */
  attendees: mongoose.Types.ObjectId[];
}

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['seminar', 'workshop', 'reunion', 'webinar', 'conference', 'other'],
      default: 'other',
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    endDate: {
      type: Date,
    },
    location: {
      type: String,
      trim: true,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    meetLink: {
      type: String,
      trim: true,
    },
    organizer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Organizer is required'],
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    maxAttendees: {
      type: Number,
    },
    tags: {
      type: [String],
      default: [],
    },
    photos: {
      type: [String],
      default: [],
    },
    rsvpEnabled: {
      type: Boolean,
      default: true,
    },
    attendees: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        if (!Array.isArray(ret.photos)) ret.photos = [];
        return ret;
      },
    },
  }
);

eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ organizer: 1 });

export const Event: Model<IEvent> = mongoose.model<IEvent>('Event', eventSchema);
