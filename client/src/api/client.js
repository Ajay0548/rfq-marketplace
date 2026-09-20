import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rfq_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Centralized error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Only clear and redirect if we had a token and weren't already on /login or /register
      const hadToken = localStorage.getItem('rfq_token');
      const isAuthPath = window.location.pathname.includes('/login') || window.location.pathname.includes('/register');
      
      if (hadToken && !isAuthPath) {
        localStorage.removeItem('rfq_token');
        localStorage.removeItem('rfq_user');
        window.location.href = '/login?expired=true';
      }
    }

    const message = error.response?.data?.message || error.message || 'An unexpected error occurred.';
    const errors = error.response?.data?.errors || null;

    return Promise.reject({
      status: error.response?.status,
      message,
      errors,
    });
  }
);

export default api;
