 
import React, { useState, useEffect } from 'react';
import { authAPI, usersAPI } from '../../services/api';
import './Profile.css';

const Profile = ({ user }) => {
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      const userData = response.data;
      setProfileData({
        full_name: userData.full_name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      setError('Failed to load profile data');
      console.error('Profile fetch error:', error);
    }
  };

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate password if provided
    if (profileData.password && profileData.password !== profileData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Prepare update data
    const updateData = {
      full_name: profileData.full_name,
      phone: profileData.phone
    };

    // Only include password if it's provided
    if (profileData.password) {
      updateData.password = profileData.password;
    }

    try {
      await usersAPI.updateUser(user.id, updateData);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Clear password fields
      setProfileData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));

      // Refresh profile data
      fetchProfile();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
    fetchProfile(); // Reset form data
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Manage your account information and preferences</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="profile-content">
        {/* Profile Information Card */}
        <div className="card profile-info-card">
          <div className="card-header">
            <h3 className="card-title">Profile Information</h3>
            {!isEditing && (
              <button 
                className="btn btn-primary"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="full_name" className="form-label">Full Name</label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  className="form-input"
                  value={profileData.full_name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  value={profileData.email}
                  disabled={true}
                  title="Email cannot be changed"
                />
                <small className="form-help">Email address cannot be modified</small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone" className="form-label">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="form-input"
                  value={profileData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <input
                  type="text"
                  className="form-input"
                  value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  disabled={true}
                />
              </div>
            </div>

            {isEditing && (
              <>
                <div className="form-divider">
                  <span>Change Password (Optional)</span>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="password" className="form-label">New Password</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      className="form-input"
                      value={profileData.password}
                      onChange={handleChange}
                      placeholder="Leave blank to keep current password"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      className="form-input"
                      value={profileData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </>
            )}

            {isEditing && (
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-success"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Save Changes'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Account Details Card */}
        <div className="card account-details-card">
          <div className="card-header">
            <h3 className="card-title">Account Details</h3>
          </div>

          <div className="account-details">
            <div className="detail-item">
              <span className="detail-label">User ID:</span>
              <span className="detail-value">#{user.id}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Account Type:</span>
              <span className={`detail-value role-badge role-${user.role}`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Member Since:</span>
              <span className="detail-value">
                {user.created_at ? formatDate(user.created_at) : 'N/A'}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Status:</span>
              <span className="detail-value status-active">Active</span>
            </div>
          </div>
        </div>

        {/* Security Notice Card */}
        <div className="card security-notice-card">
          <div className="card-header">
            <h3 className="card-title">Security Notice</h3>
          </div>

          <div className="security-content">
            <div className="security-item">
              <div className="security-icon">🔒</div>
              <div className="security-text">
                <h4>Keep your account secure</h4>
                <p>Use a strong password and keep your contact information up to date.</p>
              </div>
            </div>

            <div className="security-item">
              <div className="security-icon">📧</div>
              <div className="security-text">
                <h4>Email notifications</h4>
                <p>You'll receive email updates about your network requests and account activity.</p>
              </div>
            </div>

            <div className="security-item">
              <div className="security-icon">🔐</div>
              <div className="security-text">
                <h4>Data protection</h4>
                <p>Your personal information is encrypted and securely stored.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;