import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  FaUserMd,
  FaPhone,
  FaEnvelope,
  FaGraduationCap,
  FaBriefcase,
  FaCheckCircle,
  FaSave,
  FaExclamationCircle,
} from 'react-icons/fa';

const DoctorProfilePage = () => {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [formData, setFormData] = useState({
    phone: '',
    qualification: '',
    experience: '',
    description: '',
    profileImage: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await api.get('/dashboard/doctor');
        if (res.data.success) {
          const doc = res.data.data.doctor;
          setDoctor(doc);
          setFormData({
            phone: doc.userId?.phone || '',
            qualification: doc.qualification || '',
            experience: doc.experience || '',
            description: doc.description || '',
            profileImage: doc.profileImage || '',
          });
        }
      } catch (err) {
        setError('Failed to fetch doctor profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoc();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!doctor) return;

    setSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await api.put(`/doctors/${doctor._id}`, {
        phone: formData.phone,
        qualification: formData.qualification,
        experience: Number(formData.experience),
        description: formData.description,
        profileImage: formData.profileImage,
      });

      if (res.data.success) {
        setMessage('Your physician profile has been updated successfully.');
        setDoctor(res.data.doctor);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>
        Loading physician profile...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>Physician Profile</h1>
        <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
          Manage your clinical biography, credentials, and outpatient presentation
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
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '2rem' }}>
            <img
              src={formData.profileImage || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80'}
              alt={doctor?.userId?.name}
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '16px',
                objectFit: 'cover',
                border: '2px solid #0d9488',
              }}
            />
            <div>
              <h2 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '0.25rem' }}>
                {doctor?.userId?.name}
              </h2>
              <div style={{ fontSize: '0.875rem', color: '#0d9488', fontWeight: '600', marginBottom: '0.25rem' }}>
                {doctor?.departmentId?.name} Department
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                Consultation Fee: <strong>${doctor?.consultationFee}</strong> (Configured by Clinic Admin)
              </div>
            </div>
          </div>

          <div className="grid-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Email Address (Read-only)</label>
              <input
                type="email"
                value={doctor?.userId?.email || ''}
                disabled
                className="form-input"
                style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="grid-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Qualifications & Degrees</label>
              <input
                type="text"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Years of Experience</label>
              <input
                type="number"
                min={0}
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Profile Image URL</label>
            <input
              type="url"
              placeholder="https://..."
              value={formData.profileImage}
              onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Biography & Clinical Description</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="form-textarea"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem' }}
          >
            <FaSave />
            <span>{saving ? 'Updating Profile...' : 'Save Profile Changes'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default DoctorProfilePage;

