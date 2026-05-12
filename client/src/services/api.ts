/**
 * Base API client - all API calls go through this
 */

import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const CSRF_COOKIE = import.meta.env.VITE_CSRF_COOKIE_NAME || 'crs_csrf';
const CSRF_HEADER = import.meta.env.VITE_CSRF_HEADER_NAME || 'X-CSRF-Token';
const SAFE_METHODS = new Set(['get', 'head', 'options']);

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  if (!match) return undefined;
  return decodeURIComponent(match.substring(name.length + 1));
}

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Attach CSRF token for state-changing requests
api.interceptors.request.use((config) => {
  const method = (config.method || 'get').toLowerCase();
  if (!SAFE_METHODS.has(method)) {
    const csrf = readCookie(CSRF_COOKIE);
    if (csrf) {
      config.headers[CSRF_HEADER] = csrf;
    }
  }
  return config;
});

function isDashboardRoute(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.pathname.startsWith('/dashboard');
}

/** Pull server message body for typical CRS error JSON */
function apiErrorMessage(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') return undefined;
  const msg = (data as { message?: unknown }).message;
  return typeof msg === 'string' && msg.trim() ? msg.trim() : undefined;
}

const RATE_LIMIT_TOAST_ID = 'http-429-too-many-requests';

// Handle 401 - clear token; 429 toast when user is inside dashboard SPA routes
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const res = (
      error as {
        response?: { status?: number; data?: unknown };
      }
    ).response;

    if (res?.status === 429 && isDashboardRoute()) {
      const fallback = 'Too many requests. Please wait a moment and try again.';
      toast.error(apiErrorMessage(res.data) ?? fallback, { id: RATE_LIMIT_TOAST_ID, duration: 6000 });
    }

    return Promise.reject(error);
  }
);
