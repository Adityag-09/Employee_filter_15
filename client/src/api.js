import axios from 'axios';

/**
 * Axios instance configured with base URL and JWT interceptor
 */
const isProduction = window.location.hostname !== 'localhost';

const API = axios.create({
  baseURL: isProduction
    ? 'https://employee-filter-15.onrender.com/api'
    : 'http://localhost:5000/api',
});

// Attach JWT token to every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
