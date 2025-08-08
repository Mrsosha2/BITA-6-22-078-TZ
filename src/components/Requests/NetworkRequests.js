 
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestsAPI } from '../../services/api';
import './NetworkRequests.css';

const NetworkRequests = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    start_date: '',
    end_date: '',
    user_id: user.role === 'admin' ? '' : user.id
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [requests, filters]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = user.role === 'admin' ? {} : { user_id: user.id };
      const response = await requestsAPI.getAllRequests(params);
      setRequests(response.data);
    } catch (error) {
      setError('Failed to load requests');
      console.error('Requests fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...requests];

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(req => req.status === filters.status);
    }

    // Filter by date range
    if (filters.start_date) {
      filtered = filtered.filter(req => 
        new Date(req.created_at) >= new Date(filters.start_date)
      );
    }

    if (filters.end_date) {
      filtered = filtered.filter(req => 
        new Date(req.created_at) <= new Date(filters.end_date + 'T23:59:59')
      );
    }

    // Filter by user (admin only)
    if (user.role === 'admin' && filters.user_id) {
      filtered = filtered.filter(req => req.user_id.toString() === filters.user_id);
    }

    setFilteredRequests(filtered);
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      start_date: '',
      end_date: '',
      user_id: user.role === 'admin' ? '' : user.id
    });
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      await requestsAPI.updateRequestStatus(requestId, newStatus);
      setSuccess(`Request ${newStatus.toLowerCase()} successfully!`);
      fetchRequests();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update request status');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) {
      return;
    }

    try {
      await requestsAPI.cancelRequest(requestId);
      setSuccess('Request cancelled successfully!');
      fetchRequests();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to cancel request');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'status-badge status-pending';
      case 'approved': return 'status-badge status-approved';
      case 'rejected': return 'status-badge status-rejected';
      case 'cancelled': return 'status-badge status-cancelled';
      default: return 'status-badge';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canCancelRequest = (request) => {
    return request.status === 'Pending' && 
           (user.role === 'admin' || request.user_id === user.id);
  };

  const canUpdateStatus = (request) => {
    return user.role === 'admin' && request.status === 'Pending';
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="requests-container">
      <div className="requests-header">
        <div className="header-content">
          <h1>Network Requests</h1>
          <p>
            {user.role === 'admin' 
              ? 'Manage all network service requests' 
              : 'View and manage your network service requests'
            }
          </p>
        </div>
        <Link to="/requests/create" className="btn btn-primary">
          New Request
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

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
            <label htmlFor="status" className="form-label">Status</label>
            <select
              id="status"
              name="status"
              className="form-select"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="start_date" className="form-label">From Date</label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              className="form-input"
              value={filters.start_date}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="end_date" className="form-label">To Date</label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              className="form-input"
              value={filters.end_date}
              onChange={handleFilterChange}
            />
          </div>

          {user.role === 'admin' && (
            <div className="filter-group">
              <label htmlFor="user_id" className="form-label">User ID</label>
              <input
                type="number"
                id="user_id"
                name="user_id"
                className="form-input"
                value={filters.user_id}
                onChange={handleFilterChange}
                placeholder="Filter by User ID"
              />
            </div>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <span>
          Showing {filteredRequests.length} of {requests.length} requests
        </span>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No Requests Found</h3>
          <p>
            {requests.length === 0 
              ? "You haven't submitted any network requests yet." 
              : "No requests match your current filters."
            }
          </p>
          {requests.length === 0 && (
            <Link to="/requests/create" className="btn btn-primary">
              Create Your First Request
            </Link>
          )}
        </div>
      ) : (
        <div className="requests-list">
          {filteredRequests.map((request) => (
            <div key={request.request_id} className="request-card">
              <div className="request-header">
                <div className="request-id">
                  <strong>Request #{request.request_id}</strong>
                </div>
                <div className="request-status">
                  <span className={getStatusBadgeClass(request.status)}>
                    {request.status}
                  </span>
                </div>
              </div>

              <div className="request-content">
                <div className="request-info">
                  <div className="info-row">
                    <span className="info-label">Location:</span>
                    <span className="info-value">
                      {request.location?.area_name || 'N/A'}
                    </span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">Connection Type:</span>
                    <span className="info-value">{request.connection_type}</span>
                  </div>

                  {user.role === 'admin' && (
                    <div className="info-row">
                      <span className="info-label">User:</span>
                      <span className="info-value">
                        {request.user?.full_name} ({request.user?.email})
                      </span>
                    </div>
                  )}

                  <div className="info-row">
                    <span className="info-label">Created:</span>
                    <span className="info-value">{formatDate(request.created_at)}</span>
                  </div>
                </div>

                {request.resources && request.resources.length > 0 && (
                  <div className="request-resources">
                    <h4>Resources Requested:</h4>
                    <div className="resources-list">
                      {request.resources.map((resource, index) => (
                        <div key={index} className="resource-item">
                          <span className="resource-name">{resource.resource_name}</span>
                          <span className="resource-quantity">
                            Qty: {resource.request_resource?.quantity_used || 0}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="request-actions">
                {canUpdateStatus(request) && (
                  <>
                    <button
                      className="btn btn-success"
                      onClick={() => handleStatusUpdate(request.request_id, 'Approved')}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleStatusUpdate(request.request_id, 'Rejected')}
                    >
                      Reject
                    </button>
                  </>
                )}

                {canCancelRequest(request) && (
                  <button
                    className="btn btn-warning"
                    onClick={() => handleCancelRequest(request.request_id)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NetworkRequests;