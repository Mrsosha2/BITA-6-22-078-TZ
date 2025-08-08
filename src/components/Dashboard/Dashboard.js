 
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestsAPI, resourcesAPI, usersAPI } from '../../services/api';
import './Dashboard.css';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [resources, setResources] = useState([]);
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalResources: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's requests
      const requestsResponse = await requestsAPI.getAllRequests();
      const userRequests = requestsResponse.data;
      
      // Calculate stats
      const totalRequests = userRequests.length;
      const pendingRequests = userRequests.filter(req => req.status === 'Pending').length;
      const approvedRequests = userRequests.filter(req => req.status === 'Approved').length;
      const rejectedRequests = userRequests.filter(req => req.status === 'Rejected').length;
      
      setStats({
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests
      });

      // Get recent requests (last 5)
      const sortedRequests = userRequests
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      setRecentRequests(sortedRequests);

      // Fetch resources
      const resourcesResponse = await resourcesAPI.getAllResources();
      setResources(resourcesResponse.data);

      // Fetch admin stats if user is admin
      if (user.role === 'admin') {
        const usersResponse = await usersAPI.getAllUsers();
        setAdminStats({
          totalUsers: usersResponse.data.length,
          totalResources: resourcesResponse.data.length
        });
      }

    } catch (error) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user.full_name}!</h1>
        <p>Here's an overview of your network requests and system status.</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-total">📊</div>
          <div className="stat-content">
            <h3>{stats.totalRequests}</h3>
            <p>Total Requests</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-pending">⏳</div>
          <div className="stat-content">
            <h3>{stats.pendingRequests}</h3>
            <p>Pending Requests</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-approved">✅</div>
          <div className="stat-content">
            <h3>{stats.approvedRequests}</h3>
            <p>Approved Requests</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-rejected">❌</div>
          <div className="stat-content">
            <h3>{stats.rejectedRequests}</h3>
            <p>Rejected Requests</p>
          </div>
        </div>

        {/* Admin Stats */}
        {user.role === 'admin' && (
          <>
            <div className="stat-card">
              <div className="stat-icon stat-icon-users">👥</div>
              <div className="stat-content">
                <h3>{adminStats.totalUsers}</h3>
                <p>Total Users</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-resources">📦</div>
              <div className="stat-content">
                <h3>{adminStats.totalResources}</h3>
                <p>Total Resources</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Quick Actions</h2>
        </div>
        <div className="quick-actions">
          <Link to="/requests/create" className="action-card">
            <div className="action-icon">➕</div>
            <h3>New Request</h3>
            <p>Submit a new network service request</p>
          </Link>

          <Link to="/requests" className="action-card">
            <div className="action-icon">📋</div>
            <h3>View Requests</h3>
            <p>Check status of your submitted requests</p>
          </Link>

          {user.role === 'admin' && (
            <>
              <Link to="/admin/users" className="action-card">
                <div className="action-icon">👤</div>
                <h3>Manage Users</h3>
                <p>View and manage system users</p>
              </Link>

              <Link to="/admin/resources" className="action-card">
                <div className="action-icon">🔧</div>
                <h3>Manage Resources</h3>
                <p>Configure system resources</p>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Recent Requests */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Recent Requests</h2>
          <Link to="/requests" className="btn btn-secondary">View All</Link>
        </div>
        
        {recentRequests.length === 0 ? (
          <div className="empty-state">
            <p>No requests submitted yet.</p>
            <Link to="/requests/create" className="btn btn-primary">
              Create Your First Request
            </Link>
          </div>
        ) : (
          <div className="card">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Location</th>
                    <th>Connection Type</th>
                    <th>Status</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRequests.map((request) => (
                    <tr key={request.request_id}>
                      <td>#{request.request_id}</td>
                      <td>{request.location?.area_name || 'N/A'}</td>
                      <td>{request.connection_type}</td>
                      <td>
                        <span className={getStatusBadgeClass(request.status)}>
                          {request.status}
                        </span>
                      </td>
                      <td>{formatDate(request.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Resource Availability */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Resource Availability</h2>
        </div>
        
        {resources.length === 0 ? (
          <div className="empty-state">
            <p>No resources available.</p>
          </div>
        ) : (
          <div className="resources-grid">
            {resources.slice(0, 6).map((resource) => (
              <div key={resource.resource_id} className="resource-card">
                <h4>{resource.resource_name}</h4>
                <div className="resource-stats">
                  <div className="resource-stat">
                    <span className="stat-label">Available:</span>
                    <span className="stat-value">{resource.quantity_available}</span>
                  </div>
                  <div className="resource-stat">
                    <span className="stat-label">Total:</span>
                    <span className="stat-value">{resource.quantity_total}</span>
                  </div>
                </div>
                <div className="resource-progress">
                  <div 
                    className="resource-progress-bar"
                    style={{
                      width: `${(resource.quantity_available / resource.quantity_total) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;