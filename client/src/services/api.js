import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Base URL for accessing uploaded images (e.g., http://localhost:5000)
export const SERVER_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000, // accommodate AI model inference cold start
});

// Request interceptor: automatically attach JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('crop_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: graceful handling of common network/auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token is invalid or expired and not already on auth page, clean up
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('crop_token');
        localStorage.removeItem('crop_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/protected');
  return response.data;
};

// Scan / AI Prediction endpoints
export const predictDisease = async (formData) => {
  const response = await api.post('/scan/predict', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getScanHistory = async () => {
  const response = await api.get('/scan/history');
  return response.data;
};

export const deleteScanHistory = async (id) => {
  const response = await api.delete(`/scan/history/${id}`);
  return response.data;
};

// Weather / Agro-meteorological endpoints
export const getWeatherAdvisory = async (params = {}) => {
  const response = await api.get('/weather/advisory', { params });
  return response.data;
};

export default api;

