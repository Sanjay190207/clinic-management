import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  FaUserMd,
  FaPlus,
  FaSearch,
  FaFilter,
  FaEdit,
  FaClock,
  FaToggleOn,
  FaToggleOff,
  FaCheckCircle,
} from 'react-icons/fa';

const ManageDoctors = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'admin';

  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const [docRes, deptRes] = await Promise.all([
        api.get('/doctors?all=true'),
        api.get('/departments?all=true'),
      ]);
      if (docRes.data.success) {
        setDoctors(docRes.data.doctors);
      }
      if (deptRes.data.success) {
        setDepartments(deptRes.data.departments);
      }
    } catch (err) {
      setError('Failed to fetch doctor directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleToggleStatus = async (doc) => {
    if (!isSuperAdmin) return;
    try {
      const res = await api.patch(`/doctors/${doc._id}/status`);
      if (res.data.success) {
        setActionSuccess(`Doctor ${doc.userId?.name} status updated.`);
        fetchDoctors();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const filtered = doctors.filter((doc) => {
    if (selectedDept && doc.departmentId?._id !== selectedDept) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const nameMatch = doc.userId?.name?.toLowerCase().includes(term);
      const emailMatch = doc.userId?.email?.toLowerCase().includes(term);
      const deptMatch = doc.departmentId?.name?.toLowerCase().includes(term);
      return nameMatch || emailMatch || deptMatch;
    }
    return true;
  });

  return (
    <div>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        gap: '1rem',
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>Physician Management</h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
            Manage clinic physician profiles, clinical departments, consultation fees, and account status
          </p>
        </div>

        {isSuperAdmin && (
          <Link to="/admin/doctors/new" className="btn btn-primary">
            <FaPlus />
            <span>Add New Physician</span>
          </Link>
        )}
      </div>

      {actionSuccess && (
        <div className="alert alert-success">
          <FaCheckCircle size={16} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <span>{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          alignItems: 'center',
        }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by physician name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
            />
            <FaSearch style={{
              position: 'absolute',
              left: '0.875rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
            }} />
          </div>

          <div style={{ position: 'relative' }}>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="form-select"
              style={{ paddingLeft: '2.5rem' }}
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
            <FaFilter style={{
              position: 'absolute',
              left: '0.875rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
            }} />
          </div>

          {(selectedDept || searchTerm) && (
            <div>
              <button
                onClick={() => { setSelectedDept(''); setSearchTerm(''); }}
                className="btn btn-secondary btn-sm"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>
          Loading physician list...
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Physician</th>
                  <th>Department</th>
                  <th>Qualifications</th>
                  <th>Experience</th>
                  <th>Fee</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc) => (
                  <tr key={doc._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={doc.profileImage || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80'}
                          alt={doc.userId?.name}
                          style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: '700', color: '#0f172a' }}>{doc.userId?.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{doc.userId?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: '#0d9488', fontWeight: '600' }}>
                        {doc.departmentId?.name}
                      </span>
                    </td>
                    <td>{doc.qualification}</td>
                    <td>{doc.experience} yrs</td>
                    <td style={{ fontWeight: '700' }}>${doc.consultationFee}</td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        backgroundColor: doc.isActive ? '#dcfce7' : '#fee2e2',
                        color: doc.isActive ? '#15803d' : '#b91c1c',
                      }}>
                        {doc.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {isSuperAdmin && (
                          <Link to={`/admin/doctors/edit/${doc._id}`} className="btn btn-secondary btn-sm" title="Edit Doctor Profile">
                            <FaEdit />
                          </Link>
                        )}
                        <Link to={`/admin/working-hours?doctorId=${doc._id}`} className="btn btn-outline btn-sm" title="Configure Working Hours">
                          <FaClock />
                        </Link>
                        {isSuperAdmin && (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(doc)}
                            className="btn btn-secondary btn-sm"
                            title={doc.isActive ? 'Deactivate Doctor' : 'Activate Doctor'}
                            style={{ color: doc.isActive ? '#dc2626' : '#16a34a' }}
                          >
                            {doc.isActive ? <FaToggleOn size={18} /> : <FaToggleOff size={18} />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDoctors;
