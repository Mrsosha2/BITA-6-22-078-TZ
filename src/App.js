import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import Profile from './components/Profile/Profile';
import UserManagement from './components/Admin/UserManagement';
import ResourceManagement from './components/Admin/ResourceManagement';
import LocationManagement from './components/Admin/LocationManagement';
import NetworkRequests from './components/Requests/NetworkRequests';
import CreateRequest from './components/Requests/CreateRequest';
import Reports from './components/Admin/Reports';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('token', userData.accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {user && <Navbar user={user} onLogout={handleLogout} />}
        
        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/register" 
              element={!user ? <Register /> : <Navigate to="/" />} 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/" 
              element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/profile" 
              element={user ? <Profile user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/requests" 
              element={user ? <NetworkRequests user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/requests/create" 
              element={user ? <CreateRequest user={user} /> : <Navigate to="/login" />} 
            />
            
            {/* Admin Only Routes */}
            <Route 
              path="/admin/users" 
              element={user && user.role === 'admin' ? <UserManagement /> : <Navigate to="/" />} 
            />
            <Route 
              path="/admin/resources" 
              element={user && user.role === 'admin' ? <ResourceManagement /> : <Navigate to="/" />} 
            />
            <Route 
              path="/admin/locations" 
              element={user && user.role === 'admin' ? <LocationManagement /> : <Navigate to="/" />} 
            />
            <Route 
              path="/admin/reports" 
              element={user && user.role === 'admin' ? <Reports /> : <Navigate to="/" />} 
            />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;