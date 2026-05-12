import { api } from './api';

export interface EventRecord {
  id: string;
  _id: string;
  title: string;
  description: string;
  type: string;
  date: string;
  endDate: string;
  location: string;
  isOnline: boolean;
  meetLink: string;
  organizer: {
    _id: string;
    name: string;
    email: string;
  };
  status: string;
  maxAttendees: number;
  tags: string[];
  photos?: string[];
  createdAt: string;
  updatedAt: string;
  rsvpEnabled: boolean;
  attendees: string[];
}

interface EventListResponse {
  success: boolean;
  count: number;
  events: EventRecord[];
}

interface EventSingleResponse {
  success: boolean;
  event: EventRecord;
}

interface RsvpResponse {
  success: boolean;
  message: string;
  rsvped: boolean;
  attendeeCount: number;
}

export const eventService = {
  async getAll(): Promise<EventRecord[]> {
    const { data } = await api.get<EventListResponse>('/v1/events');
    return data.events;
  },

  async getById(id: string): Promise<EventRecord> {
    const { data } = await api.get<EventSingleResponse>(`/v1/events/${id}`);
    return data.event;
  },

  async create(body: Record<string, unknown>): Promise<EventRecord> {
    const { data } = await api.post<EventSingleResponse>('/v1/events', body);
    return data.event;
  },

  async update(id: string, body: Record<string, unknown>): Promise<EventRecord> {
    const { data } = await api.patch<EventSingleResponse>(`/v1/events/${id}`, body);
    return data.event;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/v1/events/${id}`);
  },

  async rsvp(eventId: string): Promise<RsvpResponse> {
    const { data } = await api.post<RsvpResponse>(`/v1/events/${eventId}/rsvp`);
    return data;
  },

  async cancelRsvp(eventId: string): Promise<RsvpResponse> {
    const { data } = await api.delete<RsvpResponse>(`/v1/events/${eventId}/rsvp`);
    return data;
  },
};
