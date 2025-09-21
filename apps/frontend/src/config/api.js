import axios from 'axios';
import config from './config';

// Compose base URL safely
const BACKEND = config.api.baseUrl;
const VERSION = config.api.version;
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

// Response interceptor with infinite loop protection
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if it's a 401 error and not already retrying
    if (error?.response?.status === 401 && !originalRequest._retry) {
      // Prevent retrying refresh token requests
      if (originalRequest.url === '/auth/refresh') {
        // Refresh token failed - logout immediately
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        // Check if we have a refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Create a new axios instance for refresh token request to avoid interceptor loop
        const refreshInstance = axios.create({
          baseURL: BASE_URL,
          timeout: 10000, // Shorter timeout for refresh
        });

        // Make refresh request without auth headers to avoid circular dependency
        const res = await refreshInstance.post('/auth/refresh', { 
          refreshToken: refreshToken 
        }, {
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        const { token, refreshToken: newRefreshToken } = res.data;
        
        if (!token) {
          throw new Error('No access token received');
        }

        // Update tokens
        localStorage.setItem('token', token);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Clear all tokens on any refresh failure
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        
        // Only redirect if this wasn't the original failed request
        if (originalRequest.url !== '/auth/login') {
          // Check if we're not already on login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other errors
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 400:
          console.error('Bad request:', error.response.data);
          break;
        case 403:
          console.error('Forbidden:', error.response.data);
          // Optionally redirect to unauthorized page
          if (window.location.pathname !== '/unauthorized') {
            window.location.href = '/unauthorized';
          }
          break;
        case 404:
          console.error('Not found:', error.response.data);
          break;
        case 500:
          console.error('Server error:', error.response.data);
          break;
        default:
          console.error('API Error:', error.response.status, error.response.data);
      }
    } else if (error.request) {
      // Network error
      console.error('Network error - no response received:', error.request);
    } else {
      // Other error
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Add a method to manually trigger logout
api.logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.warn('Logout request failed:', error);
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  }
};

// Add a method to check authentication status
api.isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');
  return !!(token && refreshToken);
};

// Add a method to get current user (with refresh handling)
api.getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/users/me');
    return response.data;
  } catch (error) {
    // If 401, the interceptor will handle token refresh
    if (error.response?.status !== 401) {
      throw error;
    }
    // If refresh fails, it will redirect to login
    return null;
  }
};

export default api;