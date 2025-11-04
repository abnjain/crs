import api from '@/config/api';

export const createEvent = async (eventData, photos = []) => {
  const formData = new FormData();
  Object.entries(eventData).forEach(([key, value]) => {
    formData.append(key, value);
  });
  photos.forEach((file) => formData.append('photos', file));
  return api.post('/events', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateEvent = async (id, eventData, photos = []) => {
  const formData = new FormData();
  Object.entries(eventData).forEach(([key, value]) => {
    formData.append(key, value);
  });
  photos.forEach((file) => formData.append('photos', file));
  return api.patch(`/events/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getEvents = async () => {
  return api.get('/events');
};

export const getEventById = async (id) => {
  return api.get(`/events/${id}`);
};

export const deleteEvent = async (id) => {
  return api.delete(`/events/${id}`);
};