import axios from 'axios';

// Base URL for the API
const BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
};

// Users API calls
export const usersAPI = {
  getAllUsers: (params) => api.get('/users', { params }),
  getUserById: (userId) => api.get(`/users/${userId}`),
  updateUser: (userId, userData) => api.put(`/users/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/users/${userId}`),
};

// Requests API calls
export const requestsAPI = {
  createRequest: (requestData) => api.post('/requests', requestData),
  getAllRequests: (params) => api.get('/requests', { params }),
  getRequestById: (requestId) => api.get(`/requests/${requestId}`),
  updateRequestStatus: (requestId, status) => api.put(`/requests/${requestId}/status`, { status }),
  cancelRequest: (requestId) => api.put(`/requests/${requestId}/cancel`),
  generateReports: (params) => api.get('/requests/reports/generate', { params }),
};

// Resources API calls
export const resourcesAPI = {
  getAllResources: (params) => api.get('/resources', { params }),
  getResourceById: (resourceId) => api.get(`/resources/${resourceId}`),
  createResource: (resourceData) => api.post('/admin/resources', resourceData),
  updateResource: (resourceId, resourceData) => api.put(`/admin/resources/${resourceId}`, resourceData),
  deleteResource: (resourceId) => api.delete(`/admin/resources/${resourceId}`),
};

// Location API calls
export const locationAPI = {
  getAllLocations: (params) => api.get('/locations', { params }),
  getLocationById: (locationId) => api.get(`/locations/${locationId}`),
  createLocation: (locationData) => api.post('/locations', locationData),
  updateLocation: (locationId, locationData) => api.put(`/locations/${locationId}`, locationData),
  deleteLocation: (locationId) => api.delete(`/locations/${locationId}`)
};

export default api;