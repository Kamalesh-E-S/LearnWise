import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  timeout: 10000, // 10 second timeout
  headers: {
    'Accept': 'application/json'
  }
});

// Add request interceptor to handle auth and form data
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Handle form data
    if (config.data instanceof URLSearchParams) {
      config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Get the original request configuration
    const originalRequest = error.config;

    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear auth state and redirect to login
          if (!originalRequest._retry) {
            useAuthStore.getState().signOut();
            window.location.href = '/auth';
          }
          break;
        case 422:
          // Validation error - let component handle it
          console.error('Validation error:', error.response.data);
          break;
        case 403:
          // Forbidden
          console.error('Access forbidden');
          break;
        case 404:
          // Not found
          console.error('Resource not found');
          break;
        case 500:
          // Server error
          console.error('Server error occurred');
          break;
        default:
          console.error('An error occurred:', error.response.data);
      }

      // Return the error response for component handling
      return Promise.reject(error);
    } else if (error.request) {
      // Request made but no response received
      console.error('Network error - no response received');
      
      // Retry the request once after a delay
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(api(originalRequest));
          }, 2000);
        });
      }
    } else {
      // Something happened in setting up the request
      console.error('Error setting up request:', error.message);
    }

    return Promise.reject({
      ...error,
      message: error.response?.data?.detail || 
               error.response?.data?.message || 
               'A network error occurred. Please check your connection and try again.'
    });
  }
);

export default api;
