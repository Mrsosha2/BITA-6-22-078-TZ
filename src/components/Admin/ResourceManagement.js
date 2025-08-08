 
import React, { useState, useEffect } from 'react';
import { resourcesAPI } from '../../services/api';
import './ResourceManagement.css';

const ResourceManagement = () => {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({
    name: '',
    available: ''
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [formData, setFormData] = useState({
    resource_name: '',
    quantity_total: '',
    quantity_available: ''
  });

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [resources, filters]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await resourcesAPI.getAllResources();
      setResources(response.data);
    } catch (error) {
      setError('Failed to load resources');
      console.error('Resources fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...resources];

    // Filter by name
    if (filters.name) {
      filtered = filtered.filter(resource => 
        resource.resource_name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    // Filter by availability
    if (filters.available === 'true') {
      filtered = filtered.filter(resource => resource.quantity_available > 0);
    } else if (filters.available === 'false') {
      filtered = filtered.filter(resource => resource.quantity_available === 0);
    }

    setFilteredResources(filtered);
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const clearFilters = () => {
    setFilters({
      name: '',
      available: ''
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const resetForm = () => {
    setFormData({
      resource_name: '',
      quantity_total: '',
      quantity_available: ''
    });
    setShowCreateForm(false);
    setEditingResource(null);
  };

  const validateForm = () => {
    if (!formData.resource_name.trim()) {
      setError('Resource name is required');
      return false;
    }

    if (!formData.quantity_total || parseInt(formData.quantity_total) < 0) {
      setError('Total quantity must be a positive number');
      return false;
    }

    if (!formData.quantity_available || parseInt(formData.quantity_available) < 0) {
      setError('Available quantity must be a positive number');
      return false;
    }

    if (parseInt(formData.quantity_available) > parseInt(formData.quantity_total)) {
      setError('Available quantity cannot exceed total quantity');
      return false;
    }

    return true;
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const resourceData = {
        resource_name: formData.resource_name.trim(),
        quantity_total: parseInt(formData.quantity_total),
        quantity_available: parseInt(formData.quantity_available)
      };

      await resourcesAPI.createResource(resourceData);
      setSuccess('Resource created successfully!');
      resetForm();
      fetchResources();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create resource');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleEditResource = (resource) => {
    setEditingResource(resource.resource_id);
    setFormData({
      resource_name: resource.resource_name,
      quantity_total: resource.quantity_total.toString(),
      quantity_available: resource.quantity_available.toString()
    });
  };

  const handleUpdateResource = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const resourceData = {
        resource_name: formData.resource_name.trim(),
        quantity_total: parseInt(formData.quantity_total),
        quantity_available: parseInt(formData.quantity_available)
      };

      await resourcesAPI.updateResource(editingResource, resourceData);
      setSuccess('Resource updated successfully!');
      resetForm();
      fetchResources();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update resource');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteResource = async (resourceId, resourceName) => {
    if (!window.confirm(`Are you sure you want to delete resource "${resourceName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await resourcesAPI.deleteResource(resourceId);
      setSuccess('Resource deleted successfully!');
      fetchResources();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete resource');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getAvailabilityStatus = (resource) => {
    const percentage = (resource.quantity_available / resource.quantity_total) * 100;
    if (percentage === 0) return 'out-of-stock';
    if (percentage <= 20) return 'low-stock';
    if (percentage <= 50) return 'medium-stock';
    return 'high-stock';
  };

  const getAvailabilityText = (resource) => {
    const percentage = Math.round((resource.quantity_available / resource.quantity_total) * 100);
    return `${percentage}% available`;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="resource-management-container">
      <div className="resource-management-header">
        <div className="header-content">
          <h1>Resource Management</h1>
          <p>Manage system resources and inventory</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          Add Resource
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Create/Edit Form */}
      {(showCreateForm || editingResource) && (
        <div className="card form-card">
          <div className="card-header">
            <h3 className="card-title">
              {editingResource ? 'Edit Resource' : 'Create New Resource'}
            </h3>
            <button 
              className="btn btn-secondary"
              onClick={resetForm}
            >
              Cancel
            </button>
          </div>

          <form onSubmit={editingResource ? handleUpdateResource : handleCreateResource}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="resource_name" className="form-label">
                  Resource Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="resource_name"
                  name="resource_name"
                  className="form-input"
                  value={formData.resource_name}
                  onChange={handleFormChange}
                  required
                  placeholder="Enter resource name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="quantity_total" className="form-label">
                  Total Quantity <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="quantity_total"
                  name="quantity_total"
                  className="form-input"
                  value={formData.quantity_total}
                  onChange={handleFormChange}
                  required
                  min="0"
                  placeholder="Enter total quantity"
                />
              </div>

              <div className="form-group">
                <label htmlFor="quantity_available" className="form-label">
                  Available Quantity <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="quantity_available"
                  name="quantity_available"
                  className="form-input"
                  value={formData.quantity_available}
                  onChange={handleFormChange}
                  required
                  min="0"
                  placeholder="Enter available quantity"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                {editingResource ? 'Update Resource' : 'Create Resource'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="card filters-card">
        <div className="card-header">
          <h3 className="card-title">Filters</h3>
          <button className="btn btn-secondary" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>

        <div className="filters-form">
          <div className="filter-group">
            <label htmlFor="name" className="form-label">Search by Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              value={filters.name}
              onChange={handleFilterChange}
              placeholder="Enter resource name"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="available" className="form-label">Availability</label>
            <select
              id="available"
              name="available"
              className="form-select"
              value={filters.available}
              onChange={handleFilterChange}
            >
              <option value="">All Resources</option>
              <option value="true">Available (0)</option>
              <option value="false">Out of Stock (0)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <span>
          Showing {filteredResources.length} of {resources.length} resources
        </span>
      </div>

      {/* Resources List */}
      {filteredResources.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No Resources Found</h3>
          <p>
            {resources.length === 0 
              ? "No resources have been created yet." 
              : "No resources match your current filters."
            }
          </p>
          {resources.length === 0 && (
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateForm(true)}
            >
              Create Your First Resource
            </button>
          )}
        </div>
      ) : (
        <div className="resources-grid">
          {filteredResources.map((resource) => (
            <div key={resource.resource_id} className="resource-card">
              <div className="resource-header">
                <h3 className="resource-name">{resource.resource_name}</h3>
                <div className={`availability-badge ${getAvailabilityStatus(resource)}`}>
                  {getAvailabilityText(resource)}
                </div>
              </div>

              <div className="resource-stats">
                <div className="stat-item">
                  <span className="stat-label">Available</span>
                  <span className="stat-value">{resource.quantity_available}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total</span>
                  <span className="stat-value">{resource.quantity_total}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Used</span>
                  <span className="stat-value">
                    {resource.quantity_total - resource.quantity_available}
                  </span>
                </div>
              </div>

              <div className="resource-progress">
                <div className="progress-bar">
                  <div 
                    className={`progress-fill ${getAvailabilityStatus(resource)}`}
                    style={{
                      width: `${(resource.quantity_available / resource.quantity_total) * 100}%`
                    }}
                  ></div>
                </div>
                <span className="progress-text">
                  {resource.quantity_available} / {resource.quantity_total} available
                </span>
              </div>

              <div className="resource-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => handleEditResource(resource)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDeleteResource(resource.resource_id, resource.resource_name)}
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

export default ResourceManagement;