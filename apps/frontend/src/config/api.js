// src/config/api.js
import axios from 'axios';

// Compose base URL safely
const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const VERSION = import.meta.env.VITE_API_VERSION || '/api/v1';
const BASE_URL = `${BACKEND.replace(/\/+$/, '')}${VERSION.startsWith('/') ? VERSION : `/${VERSION}`}`;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// Request interceptor adds Authorization header from localStorage (if present)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor handles 401 centrally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('token');
      // preserve current origin (SPA)
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
