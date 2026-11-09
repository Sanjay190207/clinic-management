import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import {
  FaUserPlus,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaExclamationCircle,
  FaCheckCircle,
} from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      setError('Please fill in all required registration fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify your password entry.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      navigate('/patient/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3.5rem 1.5rem',
        backgroundColor: '#f8fafc',
      }}>
        <div style={{ width: '100%', maxWidth: '520px' }}>
          <div className="card" style={{ padding: '2.5rem 2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '12px',
                backgroundColor: '#f0fdfa',
                color: '#0d9488',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}>
                <FaUserPlus size={24} />
              </div>
              <h2 style={{ fontSize: '1.75rem', color: '#0f172a', marginBottom: '0.5rem' }}>
                Patient Registration
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                Create your patient portal account to book appointments and view clinical history
              </p>
            </div>

            {error && (
              <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <FaExclamationCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Johnathan Doe"
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
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    required
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                  <FaEnvelope style={{
                    position: 'absolute',
                    left: '0.875rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                  }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Contact Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
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

              <div className="grid-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min 6 characters"
                      required
                      className="form-input"
                      style={{ paddingLeft: '2.5rem' }}
                    />
                    <FaLock style={{
                      position: 'absolute',
                      left: '0.875rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                    }} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repeat password"
                      required
                      className="form-input"
                      style={{ paddingLeft: '2.5rem' }}
                    />
                    <FaLock style={{
                      position: 'absolute',
                      left: '0.875rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                    }} />
                  </div>
                </div>
              </div>

              <div style={{
                fontSize: '0.8125rem',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.5rem',
              }}>
                <FaCheckCircle color="#0d9488" />
                <span>By registering, you agree to receive appointment reminders via email & phone.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem' }}
              >
                {loading ? 'Registering Account...' : 'Complete Registration'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
              Already registered?{' '}
              <Link to="/login" style={{ fontWeight: '600', color: '#0d9488' }}>
                Sign in to your account
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Register;
