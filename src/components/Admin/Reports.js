 
import React, { useState, useEffect } from 'react';
import { requestsAPI } from '../../services/api';
import './Reports.css';

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    period: 'monthly',
    status: ''
  });

  useEffect(() => {
    generateReport();
  }, []);

  const generateReport = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        period: filters.period
      };
      
      if (filters.status) {
        params.status = filters.status;
      }

      const response = await requestsAPI.generateReports(params);
      setReportData(response.data);
    } catch (error) {
      setError('Failed to generate report');
      console.error('Report generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleGenerateReport = () => {
    generateReport();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#ffc107';
      case 'approved': return '#28a745';
      case 'rejected': return '#dc3545';
      case 'cancelled': return '#6c757d';
      default: return '#007bff';
    }
  };

  const calculatePercentage = (value, total) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>Reports & Analytics</h1>
        <p>Generate and view system reports and statistics</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Report Filters */}
      <div className="card filters-card">
        <div className="card-header">
          <h3 className="card-title">Report Configuration</h3>
          <button 
            className="btn btn-primary"
            onClick={handleGenerateReport}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>

        <div className="filters-form">
          <div className="filter-group">
            <label htmlFor="period" className="form-label">Report Period</label>
            <select
              id="period"
              name="period"
              className="form-select"
              value={filters.period}
              onChange={handleFilterChange}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="status" className="form-label">Filter by Status</label>
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
        </div>
      </div>

      {/* Report Results */}
      {reportData && (
        <>
          {/* Report Summary */}
          <div className="card report-summary-card">
            <div className="card-header">
              <h3 className="card-title">Report Summary</h3>
              <div className="report-period">
                {formatDate(reportData.startDate)} - {formatDate(reportData.endDate)}
              </div>
            </div>

            <div className="summary-stats">
              <div className="summary-stat">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <h4>{reportData.totalRequests}</h4>
                  <p>Total Requests</p>
                </div>
              </div>

              {Object.entries(reportData.statusCounts || {}).map(([status, count]) => (
                <div key={status} className="summary-stat">
                  <div 
                    className="stat-icon"
                    style={{ backgroundColor: getStatusColor(status) + '20', color: getStatusColor(status) }}
                  >
                    {status === 'Pending' ? '⏳' : 
                     status === 'Approved' ? '✅' : 
                     status === 'Rejected' ? '❌' : '🚫'}
                  </div>
                  <div className="stat-content">
                    <h4>{count}</h4>
                    <p>{status} Requests</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Charts Section */}
          <div className="charts-grid">
            {/* Status Distribution */}
            <div className="card chart-card">
              <div className="card-header">
                <h3 className="card-title">Status Distribution</h3>
              </div>

              <div className="chart-content">
                {Object.entries(reportData.statusCounts || {}).map(([status, count]) => (
                  <div key={status} className="chart-item">
                    <div className="chart-label">
                      <span className="status-indicator" style={{ backgroundColor: getStatusColor(status) }}></span>
                      <span className="status-name">{status}</span>
                      <span className="status-count">({count})</span>
                    </div>
                    <div className="chart-bar">
                      <div 
                        className="chart-bar-fill"
                        style={{ 
                          width: `${calculatePercentage(count, reportData.totalRequests)}%`,
                          backgroundColor: getStatusColor(status)
                        }}
                      ></div>
                    </div>
                    <span className="chart-percentage">
                      {calculatePercentage(count, reportData.totalRequests)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Distribution */}
            <div className="card chart-card">
              <div className="card-header">
                <h3 className="card-title">Location Distribution</h3>
              </div>

              <div className="chart-content">
                {Object.entries(reportData.locationCounts || {}).map(([location, count]) => (
                  <div key={location} className="chart-item">
                    <div className="chart-label">
                      <span className="location-indicator">📍</span>
                      <span className="location-name">{location}</span>
                      <span className="location-count">({count})</span>
                    </div>
                    <div className="chart-bar">
                      <div 
                        className="chart-bar-fill"
                        style={{ 
                          width: `${calculatePercentage(count, reportData.totalRequests)}%`,
                          backgroundColor: '#007bff'
                        }}
                      ></div>
                    </div>
                    <span className="chart-percentage">
                      {calculatePercentage(count, reportData.totalRequests)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Connection Type Distribution */}
            <div className="card chart-card">
              <div className="card-header">
                <h3 className="card-title">Connection Type Distribution</h3>
              </div>

              <div className="chart-content">
                {Object.entries(reportData.connectionTypeCounts || {}).map(([type, count]) => (
                  <div key={type} className="chart-item">
                    <div className="chart-label">
                      <span className="connection-indicator">🔌</span>
                      <span className="connection-name">{type}</span>
                      <span className="connection-count">({count})</span>
                    </div>
                    <div className="chart-bar">
                      <div 
                        className="chart-bar-fill"
                        style={{ 
                          width: `${calculatePercentage(count, reportData.totalRequests)}%`,
                          backgroundColor: '#28a745'
                        }}
                      ></div>
                    </div>
                    <span className="chart-percentage">
                      {calculatePercentage(count, reportData.totalRequests)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="card breakdown-card">
            <div className="card-header">
              <h3 className="card-title">Detailed Breakdown</h3>
            </div>

            <div className="breakdown-content">
              <div className="breakdown-section">
                <h4>Status Analysis</h4>
                <div className="breakdown-grid">
                  {Object.entries(reportData.statusCounts || {}).map(([status, count]) => (
                    <div key={status} className="breakdown-item">
                      <div className="breakdown-header">
                        <span className="breakdown-title">{status} Requests</span>
                        <span className="breakdown-value">{count}</span>
                      </div>
                      <div className="breakdown-details">
                        <span className="breakdown-percentage">
                          {calculatePercentage(count, reportData.totalRequests)}% of total
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="breakdown-section">
                <h4>Location Analysis</h4>
                <div className="breakdown-grid">
                  {Object.entries(reportData.locationCounts || {}).map(([location, count]) => (
                    <div key={location} className="breakdown-item">
                      <div className="breakdown-header">
                        <span className="breakdown-title">{location}</span>
                        <span className="breakdown-value">{count} requests</span>
                      </div>
                      <div className="breakdown-details">
                        <span className="breakdown-percentage">
                          {calculatePercentage(count, reportData.totalRequests)}% of total
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="breakdown-section">
                <h4>Connection Type Analysis</h4>
                <div className="breakdown-grid">
                  {Object.entries(reportData.connectionTypeCounts || {}).map(([type, count]) => (
                    <div key={type} className="breakdown-item">
                      <div className="breakdown-header">
                        <span className="breakdown-title">{type}</span>
                        <span className="breakdown-value">{count} requests</span>
                      </div>
                      <div className="breakdown-details">
                        <span className="breakdown-percentage">
                          {calculatePercentage(count, reportData.totalRequests)}% of total
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {!reportData && !loading && (
        <div className="empty-state">
          <div className="empty-icon">📈</div>
          <h3>No Report Data</h3>
          <p>Click "Generate Report" to create a new report with the selected filters.</p>
          <button 
            className="btn btn-primary"
            onClick={handleGenerateReport}
          >
            Generate Your First Report
          </button>
        </div>
      )}
    </div>
  );
};

export default Reports;