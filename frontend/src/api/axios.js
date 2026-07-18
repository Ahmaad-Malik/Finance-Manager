import axios from 'axios';
import { toast } from 'react-toastify';

// Base axios instance pointed at the backend.
// Set VITE_API_URL in .env if the backend runs somewhere other than localhost:5000.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach the JWT (if present) to every outgoing request.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// If the token is invalid/expired, the backend returns 401.
// Clear stored auth and bounce to /login so the app never gets stuck
// showing protected pages with a dead session.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const wasLoggedIn = !!localStorage.getItem('token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        if (wasLoggedIn) {
          toast.error('Your session has expired. Please log in again.');
        }
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
