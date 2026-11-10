import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  FaUserShield,
  FaPlus,
  FaSearch,
  FaFilter,
  FaToggleOn,
  FaToggleOff,
  FaCheckCircle,
  FaExclamationCircle,
} from 'react-icons/fa';

const ManageUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');
  const [error, setError] = useState('');

  // Add User Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'receptionist',
  });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter) params.append('role', roleFilter);
      if (searchTerm) params.append('search', searchTerm);

      const res = await api.get(`/users?${params.toString()}`);
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch user accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, searchTerm]);

  const handleToggleStatus = async (userObj) => {
    if (userObj._id === currentUser.id || userObj._id === currentUser._id) {
      setError('You cannot deactivate your own administrative account.');
      return;
    }

    try {
      const res = await api.patch(`/users/${userObj._id}/status`);
      if (res.data.success) {
        setActionSuccess(`User ${userObj.name} has been ${res.data.user.isActive ? 'activated' : 'deactivated'}.`);
        fetchUsers();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle account status.');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      setModalError('Please provide all required account fields.');
      return;
    }

    setSubmitting(true);
    setModalError('');

    try {
      const res = await api.post('/users', formData);
      if (res.data.success) {
        setActionSuccess(`Account created for ${formData.name} with role '${formData.role}'.`);
        setIsModalOpen(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          role: 'receptionist',
        });
        fetchUsers();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to create user account.');
    } finally {
      setSubmitting(false);
    }
  };

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
          <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>Privileged User Management</h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
            System accounts, administrative roles, and access credentials
          </p>
        </div>

        <button onClick={() => { setIsModalOpen(true); setModalError(''); }} className="btn btn-primary">
          <FaPlus />
          <span>Create Staff Account</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="alert alert-success">
          <FaCheckCircle size={16} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <FaExclamationCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Toolbar */}
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
              placeholder="Search user name or email..."
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
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="form-select"
              style={{ paddingLeft: '2.5rem' }}
            >
              <option value="">All Roles</option>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="receptionist">Receptionist</option>
              <option value="admin">Administrator</option>
            </select>
            <FaFilter style={{
              position: 'absolute',
              left: '0.875rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
            }} />
          </div>

          {(roleFilter || searchTerm) && (
            <div>
              <button
                type="button"
                onClick={() => { setRoleFilter(''); setSearchTerm(''); }}
                className="btn btn-secondary btn-sm"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>
          Loading user accounts...
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Assigned Role</th>
                  <th>Status</th>
                  <th>Created On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u._id === currentUser.id || u._id === currentUser._id;
                  return (
                    <tr key={u._id}>
                      <td style={{ fontWeight: '700', color: '#0f172a' }}>
                        {u.name} {isSelf && <span style={{ color: '#0d9488', fontSize: '0.75rem' }}>(You)</span>}
                      </td>
                      <td>{u.email}</td>
                      <td>{u.phone}</td>
                      <td>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          backgroundColor:
                            u.role === 'admin' ? '#fef3c7' :
                            u.role === 'doctor' ? '#f0fdfa' :
                            u.role === 'receptionist' ? '#e0f2fe' : '#f1f5f9',
                          color:
                            u.role === 'admin' ? '#b45309' :
                            u.role === 'doctor' ? '#0f766e' :
                            u.role === 'receptionist' ? '#0284c7' : '#475569',
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          backgroundColor: u.isActive ? '#dcfce7' : '#fee2e2',
                          color: u.isActive ? '#15803d' : '#b91c1c',
                        }}>
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        {!isSelf && (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(u)}
                            className="btn btn-secondary btn-sm"
                            title={u.isActive ? 'Deactivate Account' : 'Activate Account'}
                            style={{ color: u.isActive ? '#dc2626' : '#16a34a' }}
                          >
                            {u.isActive ? <FaToggleOn size={18} /> : <FaToggleOff size={18} />}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Staff Account Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Create Staff Account</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Create an administrative or front-desk receptionist staff login
            </p>

            {modalError && (
              <div className="alert alert-danger" style={{ fontSize: '0.8125rem', marginBottom: '1rem' }}>
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Maria Gonzalez"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (Login)</label>
                <input
                  type="email"
                  placeholder="staff@carepulse.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input
                  type="tel"
                  placeholder="+1-555-0100"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="form-select"
                >
                  <option value="receptionist">Receptionist (Front Desk)</option>
                  <option value="admin">Administrator (Full Access)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;

