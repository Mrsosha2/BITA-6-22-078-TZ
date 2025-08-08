import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestsAPI, resourcesAPI, locationAPI } from '../../services/api';
import './CreateRequest.css';

const CreateRequest = ({ user }) => {
  const [formData, setFormData] = useState({
    location_id: '',
    connection_type: 'Fiber',
    resources: []
  });
  const [availableResources, setAvailableResources] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchResources();
    fetchAvailableLocations();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await resourcesAPI.getAllResources();
      setAvailableResources(response.data);
    } catch (error) {
      setError('Failed to load available resources');
      console.error('Resources fetch error:', error);
    }
  };

  const fetchAvailableLocations = async () => {
    try {
      // Fetch only available locations
      const response = await locationAPI.getAllLocations({ available: true });
      setLocations(response.data);
    } catch (error) {
      setError('Failed to load available locations');
      console.error('Locations fetch error:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleResourceChange = (resourceId, quantity) => {
    const updatedResources = [...formData.resources];
    const existingIndex = updatedResources.findIndex(r => r.resource_id === parseInt(resourceId));
    
    if (quantity > 0) {
      if (existingIndex >= 0) {
        updatedResources[existingIndex].quantity = parseInt(quantity);
      } else {
        updatedResources.push({
          resource_id: parseInt(resourceId),
          quantity: parseInt(quantity)
        });
      }
    } else {
      if (existingIndex >= 0) {
        updatedResources.splice(existingIndex, 1);
      }
    }

    setFormData({
      ...formData,
      resources: updatedResources
    });
  };

  const getResourceQuantity = (resourceId) => {
    const resource = formData.resources.find(r => r.resource_id === resourceId);
    return resource ? resource.quantity : 0;
  };

  const validateForm = () => {
    if (!formData.location_id) {
      setError('Please select a location');
      return false;
    }

    if (!formData.connection_type) {
      setError('Please select a connection type');
      return false;
    }

    if (formData.resources.length === 0) {
      setError('Please select at least one resource');
      return false;
    }

    // Check if any requested quantity exceeds available quantity
    for (const requestedResource of formData.resources) {
      const availableResource = availableResources.find(r => r.resource_id === requestedResource.resource_id);
      if (availableResource && requestedResource.quantity > availableResource.quantity_available) {
        setError(`Requested quantity for ${availableResource.resource_name} exceeds available quantity (${availableResource.quantity_available})`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const requestData = {
        location_id: parseInt(formData.location_id),
        connection_type: formData.connection_type,
        resources: formData.resources
      };

      await requestsAPI.createRequest(requestData);
      setSuccess('Network request submitted successfully!');
      
      // Redirect to requests page after a short delay
      setTimeout(() => {
        navigate('/requests');
      }, 2000);

    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/requests');
  };

  return (
    <div className="create-request-container">
      <div className="create-request-header">
        <h1>Create Network Request</h1>
        <p>Submit a new request for network services and resources</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="create-request-form">
        {/* Basic Information */}
        <div className="card form-section">
          <div className="card-header">
            <h3 className="card-title">Basic Information</h3>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="location_id" className="form-label">
                Location <span className="required">*</span>
              </label>
              <select
                id="location_id"
                name="location_id"
                className="form-select"
                value={formData.location_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a location</option>
                {locations.map((location) => (
                  <option key={location.location_id} value={location.location_id}>
                    {location.area_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="connection_type" className="form-label">
                Connection Type <span className="required">*</span>
              </label>
              <select
                id="connection_type"
                name="connection_type"
                className="form-select"
                value={formData.connection_type}
                onChange={handleInputChange}
                required
              >
                <option value="Fiber">Fiber Optic</option>
                <option value="Copper">Copper Cable</option>
                <option value="Wireless">Wireless</option>
                <option value="Satellite">Satellite</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resource Selection */}
        <div className="card form-section">
          <div className="card-header">
            <h3 className="card-title">Resource Requirements</h3>
            <p className="card-subtitle">Select the resources you need for your network setup</p>
          </div>

          {availableResources.length === 0 ? (
            <div className="no-resources">
              <p>No resources available at the moment.</p>
            </div>
          ) : (
            <div className="resources-grid">
              {availableResources.map((resource) => (
                <div key={resource.resource_id} className="resource-card">
                  <div className="resource-info">
                    <h4 className="resource-name">{resource.resource_name}</h4>
                    <div className="resource-availability">
                      <span className="availability-label">Available:</span>
                      <span className="availability-value">
                        {resource.quantity_available} / {resource.quantity_total}
                      </span>
                    </div>
                  </div>

                  <div className="resource-input">
                    <label htmlFor={`resource_${resource.resource_id}`} className="form-label">
                      Quantity Needed
                    </label>
                    <input
                      type="number"
                      id={`resource_${resource.resource_id}`}
                      className="form-input"
                      min="0"
                      max={resource.quantity_available}
                      value={getResourceQuantity(resource.resource_id)}
                      onChange={(e) => handleResourceChange(resource.resource_id, e.target.value)}
                      placeholder="0"
                    />
                  </div>

                  <div className="resource-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{
                          width: `${(resource.quantity_available / resource.quantity_total) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="progress-text">
                      {Math.round((resource.quantity_available / resource.quantity_total) * 100)}% available
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Request Summary */}
        {formData.resources.length > 0 && (
          <div className="card form-section">
            <div className="card-header">
              <h3 className="card-title">Request Summary</h3>
            </div>

            <div className="request-summary">
              <div className="summary-item">
                <span className="summary-label">Location:</span>
                <span className="summary-value">
                  {locations.find(l => l.location_id === parseInt(formData.location_id))?.area_name || 'Not selected'}
                </span>
              </div>

              <div className="summary-item">
                <span className="summary-label">Connection Type:</span>
                <span className="summary-value">{formData.connection_type}</span>
              </div>

              <div className="summary-resources">
                <h4>Selected Resources:</h4>
                <div className="selected-resources">
                  {formData.resources.map((resource) => {
                    const resourceInfo = availableResources.find(r => r.resource_id === resource.resource_id);
                    return (
                      <div key={resource.resource_id} className="selected-resource">
                        <span className="resource-name">{resourceInfo?.resource_name}</span>
                        <span className="resource-quantity">Qty: {resource.quantity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </button>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading || formData.resources.length === 0}
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRequest;