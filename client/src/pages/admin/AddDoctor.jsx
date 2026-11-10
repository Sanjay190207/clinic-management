import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  FaUserMd,
  FaArrowLeft,
  FaSave,
  FaExclamationCircle,
} from 'react-icons/fa';

const AddDoctor = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: 'Doctor@123',
    departmentId: '',
    qualification: '',
    experience: 5,
    consultationFee: 120,
    description: '',
    profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get('/departments');
        if (res.data.success && res.data.departments.length > 0) {
          setDepartments(res.data.departments);
          setFormData((prev) => ({ ...prev, departmentId: res.data.departments[0]._id }));
        }
      } catch (err) {
        console.error('Failed to load departments', err);
      }
    };
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.phone || !formData.departmentId || !formData.qualification) {
      setError('Please provide all mandatory physician details and credentials.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/doctors', formData);
      if (res.data.success) {
        navigate('/admin/doctors');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create doctor account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link to="/admin/doctors" className="btn btn-secondary btn-sm">
          <FaArrowLeft />
          <span>Back to Physicians</span>
        </Link>
        <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>Register New Physician</h1>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <FaExclamationCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="card" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit}>
          <div style={{
            fontSize: '0.875rem',
            fontWeight: '700',
            color: '#0d9488',
            textTransform: 'uppercase',
            marginBottom: '1rem',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '0.5rem',
          }}>
            1. User Account & Access Credentials
          </div>

          <div className="grid-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Physician Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Dr. Arthur Dent"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Login) *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="doctor@carepulse.com"
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="grid-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Contact Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1-555-0000"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Initial Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
          </div>

          <div style={{
            fontSize: '0.875rem',
            fontWeight: '700',
            color: '#0d9488',
            textTransform: 'uppercase',
            margin: '1.5rem 0 1rem',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '0.5rem',
          }}>
            2. Professional Profile & Clinical Configuration
          </div>

          <div className="grid-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Clinical Department *</label>
              <select
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                required
                className="form-select"
              >
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Degrees & Qualifications *</label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                placeholder="e.g. MBBS, MD (Cardiology)"
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="grid-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Experience (Years) *</label>
              <input
                type="number"
                min={0}
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Consultation Fee ($) *</label>
              <input
                type="number"
                min={0}
                name="consultationFee"
                value={formData.consultationFee}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Profile Image URL</label>
            <input
              type="url"
              name="profileImage"
              value={formData.profileImage}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/..."
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Clinical Biography & Description *</label>
            <textarea
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed doctor background, clinical areas of interest, achievements..."
              required
              className="form-textarea"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Link to="/admin/doctors" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              <FaSave />
              <span>{loading ? 'Creating Doctor...' : 'Register Physician'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDoctor;

