import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaHeartbeat,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
} from 'react-icons/fa';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#0f172a',
      color: '#cbd5e1',
      paddingTop: '4rem',
      paddingBottom: '2rem',
      marginTop: 'auto',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem',
        }}>
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
              <div style={{
                background: '#0d9488',
                color: '#ffffff',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <FaHeartbeat size={18} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff' }}>CarePulse</span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.7', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Modern, patient-centered clinic delivering excellence in primary care, specialized consultations, and preventive medicine.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaPhoneAlt color="#2dd4bf" />
                <span>Emergency: +1 (800) 555-CARE</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaEnvelope color="#2dd4bf" />
                <span>support@carepulse.com</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaMapMarkerAlt color="#2dd4bf" />
                <span>452 Wellness Blvd, Health District</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#ffffff', marginBottom: '1.25rem', fontSize: '1rem', fontWeight: '600' }}>Quick Navigation</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <li><Link to="/" style={{ color: '#94a3b8' }}>Home</Link></li>
              <li><Link to="/about" style={{ color: '#94a3b8' }}>About Our Clinic</Link></li>
              <li><Link to="/services" style={{ color: '#94a3b8' }}>Clinical Services</Link></li>
              <li><Link to="/doctors" style={{ color: '#94a3b8' }}>Find a Doctor</Link></li>
              <li><Link to="/register" style={{ color: '#94a3b8' }}>Patient Registration</Link></li>
              <li><Link to="/login" style={{ color: '#94a3b8' }}>Patient & Staff Login</Link></li>
            </ul>
          </div>

          {/* Clinical Departments */}
          <div>
            <h4 style={{ color: '#ffffff', marginBottom: '1.25rem', fontSize: '1rem', fontWeight: '600' }}>Specialties</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', color: '#94a3b8' }}>
              <li>Cardiology & Heart Health</li>
              <li>General Internal Medicine</li>
              <li>Pediatrics & Adolescent Health</li>
              <li>Dermatology & Skin Care</li>
              <li>Orthopedic Care & Sports Medicine</li>
              <li>Neurology & Cognitive Care</li>
            </ul>
          </div>

          {/* Clinic Hours */}
          <div>
            <h4 style={{ color: '#ffffff', marginBottom: '1.25rem', fontSize: '1rem', fontWeight: '600' }}>Operating Hours</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem', color: '#94a3b8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem' }}>
                <span>Mon – Fri:</span>
                <span style={{ color: '#ffffff', fontWeight: '500' }}>08:00 AM – 06:00 PM</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem' }}>
                <span>Saturday:</span>
                <span style={{ color: '#ffffff', fontWeight: '500' }}>09:00 AM – 02:00 PM</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Sunday:</span>
                <span style={{ color: '#ef4444', fontWeight: '500' }}>Closed (Emergency Only)</span>
              </div>
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                backgroundColor: 'rgba(13, 148, 136, 0.1)',
                border: '1px solid #0f766e',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                color: '#5eead4',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <FaClock />
                <span>Same-day online booking available 24/7</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid #1e293b',
          paddingTop: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.8125rem',
          color: '#64748b',
        }}>
          <div>
            &copy; {new Date().getFullYear()} CarePulse Clinic Appointment Management System. All rights reserved.
          </div>
          <div>
            Built with React.js, Express, MongoDB & Node.js
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

