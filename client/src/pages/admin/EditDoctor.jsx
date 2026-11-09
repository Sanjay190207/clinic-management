import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  FaUserMd,
  FaArrowLeft,
  FaSave,
  FaExclamationCircle,
} from 'react-icons/fa';

const EditDoctor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    departmentId: '',
    qualification: '',
    experience: 0,
    consultationFee: 0,
    description: '',
    profileImage: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [docRes, deptRes] = await Promise.all([
          api.get(`/doctors/${id}`),
          api.get('/departments?all=true'),
        ]);

        if (deptRes.data.success) {
          setDepartments(deptRes.data.departments);
        }

        if (docRes.data.success) {
          const doc = docRes.data.doctor;
          setFormData({
            name: doc.userId?.name || '',
            phone: doc.userId?.phone || '',
            departmentId: doc.departmentId?._id || '',
            qualification: doc.qualification || '',
            experience: doc.experience || 0,
            consultationFee: doc.consultationFee || 0,
            description: doc.description || '',
            profileImage: doc.profileImage || '',
            isActive: doc.isActive,
          });
        }
      } catch (err) {
        setError('Failed to load physician details.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id]);

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    setSaving(true);
    try {
      const res = await api.put(`/doctors/${id}`, {
        name: formData.name,
        phone: formData.phone,
        departmentId: formData.departmentId,
        qualification: formData.qualification,
        experience: Number(formData.experience),
        consultationFee: Number(formData.consultationFee),
        description: formData.description,
        profileImage: formData.profileImage,
        isActive: formData.isActive,
      });

      if (res.data.success) {
        navigate('/admin/doctors');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update physician profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>
        Loading physician details...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link to="/admin/doctors" className="btn btn-secondary btn-sm">
          <FaArrowLeft />
          <span>Back to Physicians</span>
        </Link>
        <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>Edit Physician Profile</h1>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <FaExclamationCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="card" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit}>
          <div className="grid-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="grid-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Department</label>
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
              <label className="form-label">Qualifications</label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="grid-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Years of Experience</label>
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
              <label className="form-label">Consultation Fee ($)</label>
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
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Clinical Description</label>
            <textarea
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="form-textarea"
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                style={{ width: '18px', height: '18px', accentColor: '#0d9488' }}
              />
              <span style={{ fontWeight: '600' }}>Active for Outpatient Appointments</span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Link to="/admin/doctors" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
            >
              <FaSave />
              <span>{saving ? 'Updating...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDoctor;
