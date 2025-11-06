import api from '@/config/api';

export const createEvent = async (eventData, photos = []) => {
  // console.log("FormData contents create service:");
  // for (const [key, value] of Object.entries(eventData)) {
  //   console.log(`${key}:`, value);
  // }
  return api.post('/events', eventData, {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("token")}`,
      'Content-Type': 'multipart/form-data'
    },
  });
};

export const updateEvent = async (id, eventData, photos = []) => {
  return api.patch(`/events/${id}`, eventData, {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("token")}`,
      'Content-Type': 'multipart/form-data'
    },
  });
};

export const getEvents = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return api.get(`/events?${query ? `${query}` : ''}`);
};

export const getEventById = async (id) => {
  return api.get(`/events/${id}`);
};

export const deleteEvent = async (id) => {
  return api.delete(`/events/${id}`);
};