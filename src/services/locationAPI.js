import api from './api';

// Location API calls
export const locationAPI = {
  // Get all locations with optional available filter
  getAllLocations: (params) => api.get('/locations', { params }),
  
  // Get location by ID
  getLocationById: (locationId) => api.get(`/locations/${locationId}`),
  
  // Create new location (Admin only)
  createLocation: (locationData) => api.post('/locations', locationData),
  
  // Update location (Admin only)
  updateLocation: (locationId, locationData) => api.put(`/locations/${locationId}`, locationData),
  
  // Delete location (Admin only)
  deleteLocation: (locationId) => api.delete(`/locations/${locationId}`)
};

export default locationAPI;