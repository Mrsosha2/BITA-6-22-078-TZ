 
import React, { useState, useEffect } from 'react';
import { usersAPI } from '../../services/api';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({
    name: '',
    role: ''
  });
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    password: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAllUsers();
      setUsers(response.data);
    } catch (error) {
      setError('Failed to load users');
      console.error('Users fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Filter by name
    if (filters.name) {
      filtered = filtered.filter(user => 
        user.full_name.toLowerCase().includes(filters.name.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    // Filter by role
    if (filters.role) {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    setFilteredUsers(filtered);
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
      role: ''
    });
  };

  const handleEditUser = (user) => {
    setEditingUser(user.user_id);
    setEditForm({
      full_name: user.full_name,
      phone: user.phone || '',
      password: ''
    });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({
      full_name: '',
      phone: '',
      password: ''
    });
  };

  const handleEditFormChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateUser = async (userId) => {
    try {
      const updateData = {
        full_name: editForm.full_name,
        phone: editForm.phone
      };

      // Only include password if provided
      if (editForm.password) {
        updateData.password = editForm.password;
      }

      await usersAPI.updateUser(userId, updateData);
      setSuccess('User updated successfully!');
      setEditingUser(null);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update user');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await usersAPI.deleteUser(userId);
      setSuccess('User deleted successfully!');
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete user');
      setTimeout(() => setError(''), 3000);
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

  const getRoleBadgeClass = (role) => {
    return role === 'admin' ? 'role-badge role-admin' : 'role-badge role-user';
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="user-management-container">
      <div className="user-management-header">
        <h1>User Management</h1>
        <p>Manage system users and their permissions</p>
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
            <label htmlFor="name" className="form-label">Search by Name/Email</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              value={filters.name}
              onChange={handleFilterChange}
              placeholder="Enter name or email"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="role" className="form-label">Role</label>
            <select
              id="role"
              name="role"
              className="form-select"
              value={filters.role}
              onChange={handleFilterChange}
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <span>
          Showing {filteredUsers.length} of {users.length} users
        </span>
      </div>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No Users Found</h3>
          <p>No users match your current filters.</p>
        </div>
      ) : (
        <div className="users-list">
          {filteredUsers.map((user) => (
            <div key={user.user_id} className="user-card">
              {editingUser === user.user_id ? (
                // Edit Mode
                <div className="user-edit-form">
                  <div className="edit-header">
                    <h3>Edit User: {user.email}</h3>
                  </div>

                  <div className="edit-form-grid">
                    <div className="form-group">
                      <label htmlFor="full_name" className="form-label">Full Name</label>
                      <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        className="form-input"
                        value={editForm.full_name}
                        onChange={handleEditFormChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone" className="form-label">Phone</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className="form-input"
                        value={editForm.phone}
                        onChange={handleEditFormChange}
                        placeholder="Phone number"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="password" className="form-label">New Password</label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        className="form-input"
                        value={editForm.password}
                        onChange={handleEditFormChange}
                        placeholder="Leave blank to keep current password"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-input"
                        value={user.email}
                        disabled
                        title="Email cannot be changed"
                      />
                    </div>
                  </div>

                  <div className="edit-actions">
                    <button
                      className="btn btn-success"
                      onClick={() => handleUpdateUser(user.user_id)}
                    >
                      Save Changes
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <>
                  <div className="user-header">
                    <div className="user-main-info">
                      <h3 className="user-name">{user.full_name}</h3>
                      <p className="user-email">{user.email}</p>
                    </div>
                    <div className="user-role">
                      <span className={getRoleBadgeClass(user.role)}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="user-details">
                    <div className="detail-row">
                      <span className="detail-label">User ID:</span>
                      <span className="detail-value">#{user.user_id}</span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Phone:</span>
                      <span className="detail-value">{user.phone || 'Not provided'}</span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Joined:</span>
                      <span className="detail-value">{formatDate(user.created_at)}</span>
                    </div>
                  </div>

                  <div className="user-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleEditUser(user)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteUser(user.user_id, user.full_name)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserManagement;