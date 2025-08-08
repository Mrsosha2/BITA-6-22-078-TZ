import React, { useState, useEffect } from 'react';
import { locationAPI } from '../../services/api';
import './LocationManagement.css';

const LocationManagement = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [formData, setFormData] = useState({
    area_name: '',
    is_network_available: true
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await locationAPI.getAllLocations();
      setLocations(response.data);
    } catch (error) {
      setError('Failed to load locations');
      console.error('Locations fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    if (error) setError('');
    if (success) setSuccess('');
  };

  const resetForm = () => {
    setFormData({
      area_name: '',
      is_network_available: true
    });
    setShowCreateForm(false);
    setEditingLocation(null);
  };

  const validateForm = () => {
    if (!formData.area_name.trim()) {
      setError('Area name is required');
      return false;
    }
    return true;
  };

  const handleCreateLocation = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const locationData = {
        area_name: formData.area_name.trim(),
        is_network_available: formData.is_network_available
      };

      await locationAPI.createLocation(locationData);
      setSuccess('Location created successfully!');
      resetForm();
      fetchLocations();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create location');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleEditLocation = (location) => {
    setEditingLocation(location.location_id);
    setFormData({
      area_name: location.area_name,
      is_network_available: location.is_network_available
    });
  };

  const handleUpdateLocation = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const locationData = {
        area_name: formData.area_name.trim(),
        is_network_available: formData.is_network_available
      };

      await locationAPI.updateLocation(editingLocation, locationData);
      setSuccess('Location updated successfully!');
      resetForm();
      fetchLocations();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update location');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteLocation = async (locationId, areaName) => {
    if (!window.confirm(`Are you sure you want to delete location "${areaName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await locationAPI.deleteLocation(locationId);
      setSuccess('Location deleted successfully!');
      fetchLocations();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete location');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="location-management-container">
      <div className="location-management-header">
        <div className="header-content">
          <h1>Location Management</h1>
          <p>Manage system locations and network availability</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          Add Location
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Create/Edit Form */}
      {(showCreateForm || editingLocation) && (
        <div className="card form-card">
          <div className="card-header">
            <h3 className="card-title">
              {editingLocation ? 'Edit Location' : 'Create New Location'}
            </h3>
            <button 
              className="btn btn-secondary"
              onClick={resetForm}
            >
              Cancel
            </button>
          </div>

          <form onSubmit={editingLocation ? handleUpdateLocation : handleCreateLocation}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="area_name" className="form-label">
                  Area Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="area_name"
                  name="area_name"
                  className="form-input"
                  value={formData.area_name}
                  onChange={handleFormChange}
                  required
                  placeholder="Enter area name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="is_network_available" className="form-label">
                  Network Available
                </label>
                <div className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    id="is_network_available"
                    name="is_network_available"
                    checked={formData.is_network_available}
                    onChange={handleFormChange}
                  />
                  <span className="checkbox-label">
                    {formData.is_network_available ? 'Available' : 'Not Available'}
                  </span>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                {editingLocation ? 'Update Location' : 'Create Location'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Locations List */}
      {locations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📍</div>
          <h3>No Locations Found</h3>
          <p>No locations have been created yet.</p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            Create Your First Location
          </button>
        </div>
      ) : (
        <div className="locations-grid">
          {locations.map((location) => (
            <div key={location.location_id} className="location-card">
              <div className="location-header">
                <h3 className="location-name">{location.area_name}</h3>
                <div className={`availability-badge ${location.is_network_available ? 'available' : 'unavailable'}`}>
                  {location.is_network_available ? 'Available' : 'Unavailable'}
                </div>
              </div>

              <div className="location-details">
                <div className="detail-item">
                  <span className="detail-label">Location ID:</span>
                  <span className="detail-value">#{location.location_id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Network Status:</span>
                  <span className={`detail-value ${location.is_network_available ? 'status-available' : 'status-unavailable'}`}>
                    {location.is_network_available ? '✅ Available' : '❌ Unavailable'}
                  </span>
                </div>
              </div>

              <div className="location-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => handleEditLocation(location)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDeleteLocation(location.location_id, location.area_name)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationManagement;