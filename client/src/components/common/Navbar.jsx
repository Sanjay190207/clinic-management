import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaHeartbeat,
  FaBars,
  FaTimes,
  FaUserCircle,
  FaSignOutAlt,
  FaTachometerAlt,
} from 'react-icons/fa';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'patient') return '/patient/dashboard';
    if (user.role === 'doctor') return '/doctor/dashboard';
    if (['admin', 'receptionist'].includes(user.role)) return '/admin/dashboard';
    return '/';
  };

  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px',
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          textDecoration: 'none',
          color: '#0f766e',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
            color: '#ffffff',
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(13, 148, 136, 0.25)',
          }}>
            <FaHeartbeat size={22} />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.02em', color: '#0f172a' }}>
              CarePulse
            </span>
            <span style={{ fontSize: '0.75rem', display: 'block', color: '#0d9488', fontWeight: '600', marginTop: '-4px' }}>
              CLINIC & HEALTHCARE
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
        }} className="desktop-nav">
          <Link to="/" style={{ fontWeight: '500', color: '#334155' }}>Home</Link>
          <Link to="/about" style={{ fontWeight: '500', color: '#334155' }}>About Us</Link>
          <Link to="/services" style={{ fontWeight: '500', color: '#334155' }}>Services</Link>
          <Link to="/doctors" style={{ fontWeight: '500', color: '#334155' }}>Doctors</Link>
        </nav>

        {/* Auth Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }} className="desktop-auth">
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <Link to={getDashboardLink()} className="btn btn-primary btn-sm">
                <FaTachometerAlt />
                <span>Dashboard</span>
              </Link>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#f1f5f9',
                padding: '0.375rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                color: '#1e293b',
              }}>
                <FaUserCircle color="#0d9488" size={16} />
                <span style={{ fontWeight: '600' }}>{user.name.split(' ')[0]}</span>
                <span style={{
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  background: '#0d9488',
                  color: '#ffffff',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  fontWeight: '700',
                }}>
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Log out"
                style={{ padding: '0.5rem' }}
              >
                <FaSignOutAlt />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Book Appointment
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.25rem',
            color: '#334155',
            cursor: 'pointer',
            display: 'none',
          }}
          className="mobile-toggle"
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '1rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
          <Link to="/services" onClick={() => setMobileMenuOpen(false)}>Services</Link>
          <Link to="/doctors" onClick={() => setMobileMenuOpen(false)}>Doctors</Link>
          <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9' }} />
          {isAuthenticated ? (
            <>
              <Link to={getDashboardLink()} className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>
                Go to Dashboard ({user.role})
              </Link>
              <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="btn btn-secondary">
                Logout
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setMobileMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ flex: 1 }} onClick={() => setMobileMenuOpen(false)}>
                Register
              </Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav, .desktop-auth { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;

