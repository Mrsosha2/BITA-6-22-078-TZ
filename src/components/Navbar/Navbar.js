import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          Network Manager
        </Link>

        <div className="navbar-toggle" onClick={toggleMenu}>
          <span className="navbar-toggle-icon"></span>
          <span className="navbar-toggle-icon"></span>
          <span className="navbar-toggle-icon"></span>
        </div>

        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <div className="navbar-nav">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/')}`}
              onClick={closeMenu}
            >
              Dashboard
            </Link>
            
            <Link 
              to="/requests" 
              className={`nav-link ${isActive('/requests')}`}
              onClick={closeMenu}
            >
              My Requests
            </Link>
            
            <Link 
              to="/requests/create" 
              className={`nav-link ${isActive('/requests/create')}`}
              onClick={closeMenu}
            >
              New Request
            </Link>

            {user.role === 'admin' && (
              <>
                <Link 
                  to="/admin/users" 
                  className={`nav-link ${isActive('/admin/users')}`}
                  onClick={closeMenu}
                >
                  Users
                </Link>
                
                <Link 
                  to="/admin/resources" 
                  className={`nav-link ${isActive('/admin/resources')}`}
                  onClick={closeMenu}
                >
                  Resources
                </Link>
                
                <Link 
                  to="/admin/locations" 
                  className={`nav-link ${isActive('/admin/locations')}`}
                  onClick={closeMenu}
                >
                  Locations
                </Link>
                
                <Link 
                  to="/admin/reports" 
                  className={`nav-link ${isActive('/admin/reports')}`}
                  onClick={closeMenu}
                >
                  Reports
                </Link>
              </>
            )}
          </div>

          <div className="navbar-user">
            <div className="user-info">
              <span className="user-name">{user.full_name}</span>
              <span className="user-role">({user.role})</span>
            </div>
            
            <div className="user-menu">
              <Link 
                to="/profile" 
                className={`nav-link ${isActive('/profile')}`}
                onClick={closeMenu}
              >
                Profile
              </Link>
              
              <button 
                className="logout-btn"
                onClick={() => {
                  closeMenu();
                  onLogout();
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;