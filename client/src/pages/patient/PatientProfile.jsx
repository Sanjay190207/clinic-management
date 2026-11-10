import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCheckCircle,
  FaExclamationCircle,
  FaSave,
  FaShieldAlt,
} from 'react-icons/fa';

const PatientProfile = () => {
  const { user, updateUserState } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!name || !phone) {
      setError('Please provide your name and phone number.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.put('/patients/profile', { name, phone });
      if (res.data.success) {
        setMessage('Your profile information has been successfully updated.');
        updateUserState({ name, phone });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>My Patient Profile</h1>
        <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
          Manage your personal contact information for clinic records and notifications
        </p>
      </div>

      {message && (
        <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <FaCheckCircle size={18} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <FaExclamationCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="card" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
              />
              <FaUser style={{
                position: 'absolute',
                left: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address (Read-only)</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="form-input"
                style={{ paddingLeft: '2.5rem', backgroundColor: '#f1f5f9', color: '#64748b' }}
              />
              <FaEnvelope style={{
                position: 'absolute',
                left: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }} />
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
              Primary login email is verified and cannot be changed directly online.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Contact Phone Number</label>
            <div style={{ position: 'relative' }}>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
              />
              <FaPhone style={{
                position: 'absolute',
                left: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }} />
            </div>
          </div>

          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            fontSize: '0.8125rem',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            <FaShieldAlt color="#0d9488" size={20} />
            <span>
              Your personal contact details are stored securely and only accessible to clinic staff and consulting physicians.
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem' }}
          >
            <FaSave />
            <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default PatientProfile;

