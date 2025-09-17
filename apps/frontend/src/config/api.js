// src/config/api.js
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

// Response interceptor handles 401 centrally
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {

//     if (error.response?.status === 401) {
//       try {
//         const { data } = await axios.post("/api/auth/refresh", { refreshToken: localStorage.getItem("refreshToken") });
//         localStorage.setItem("accessToken", data.accessToken);
//         error.config.headers["Authorization"] = `Bearer ${data.accessToken}`;
//         return api.request(error.config);
//       } catch (e) {
//         // logout
//         localStorage.clear();
//         window.location.href = "/login";
//       }
//     }

//     return Promise.reject(error);
//   }
// );


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error?.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const res = await api.post('/auth/refresh', { 
          refreshToken: localStorage.getItem('refreshToken') 
        });
        
        const { token, refreshToken: newRefreshToken } = res.data;
        localStorage.setItem('token', token);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }
        
        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        // If refresh fails, clear all tokens and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
