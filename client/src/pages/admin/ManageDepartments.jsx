import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  FaHospital,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaExclamationCircle,
  FaToggleOn,
  FaToggleOff,
} from 'react-icons/fa';

const ManageDepartments = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'admin';

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');
  const [error, setError] = useState('');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/departments?all=true');
      if (res.data.success) {
        setDepartments(res.data.departments);
      }
    } catch (err) {
      setError('Failed to fetch departments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const openAddModal = () => {
    setEditingDept(null);
    setFormName('');
    setFormDesc('');
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (dept) => {
    setEditingDept(dept);
    setFormName(dept.name);
    setFormDesc(dept.description);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!formName || !formDesc) {
      setModalError('Please enter both name and description.');
      return;
    }

    setSubmitting(true);
    setModalError('');

    try {
      if (editingDept) {
        const res = await api.put(`/departments/${editingDept._id}`, {
          name: formName,
          description: formDesc,
        });
        if (res.data.success) {
          setActionSuccess(`Department '${formName}' updated successfully.`);
        }
      } else {
        const res = await api.post('/departments', {
          name: formName,
          description: formDesc,
        });
        if (res.data.success) {
          setActionSuccess(`Department '${formName}' created successfully.`);
        }
      }
      setIsModalOpen(false);
      fetchDepartments();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (dept) => {
    if (!isSuperAdmin) return;
    try {
      const res = await api.put(`/departments/${dept._id}`, {
        isActive: !dept.isActive,
      });
      if (res.data.success) {
        setActionSuccess(`Department '${dept.name}' is now ${!dept.isActive ? 'Active' : 'Inactive'}.`);
        fetchDepartments();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle status.');
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
          <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>Department Management</h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
            Configure clinical departments, medical descriptions, and specialist associations
          </p>
        </div>

        {isSuperAdmin && (
          <button onClick={openAddModal} className="btn btn-primary">
            <FaPlus />
            <span>Add Department</span>
          </button>
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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>
          Loading clinical departments...
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Department Name</th>
                  <th>Clinical Scope</th>
                  <th>Doctors Assigned</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept) => (
                  <tr key={dept._id}>
                    <td style={{ fontWeight: '700', color: '#0f172a' }}>{dept.name}</td>
                    <td style={{ maxWidth: '340px', fontSize: '0.875rem', color: '#475569' }}>
                      {dept.description}
                    </td>
                    <td>
                      <span style={{ fontWeight: '600', color: '#0d9488' }}>
                        {dept.doctorCount || 0} Doctor{(dept.doctorCount || 0) === 1 ? '' : 's'}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        backgroundColor: dept.isActive ? '#dcfce7' : '#fee2e2',
                        color: dept.isActive ? '#15803d' : '#b91c1c',
                      }}>
                        {dept.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      {isSuperAdmin ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => openEditModal(dept)}
                            className="btn btn-secondary btn-sm"
                            title="Edit Department"
                          >
                            <FaEdit />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(dept)}
                            className="btn btn-secondary btn-sm"
                            title={dept.isActive ? 'Deactivate' : 'Activate'}
                            style={{ color: dept.isActive ? '#dc2626' : '#16a34a' }}
                          >
                            {dept.isActive ? <FaToggleOn size={18} /> : <FaToggleOff size={18} />}
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>View Only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Department Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
              {editingDept ? 'Edit Department' : 'Add New Department'}
            </h3>

            {modalError && (
              <div className="alert alert-danger" style={{ fontSize: '0.8125rem', marginBottom: '1rem' }}>
                {modalError}
              </div>
            )}

            <form onSubmit={handleModalSubmit}>
              <div className="form-group">
                <label className="form-label">Department Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ophthalmology, Oncology..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Clinical Scope & Description</label>
                <textarea
                  rows={4}
                  placeholder="Describe treatment capabilities, symptoms evaluated, and clinical services..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  required
                  className="form-textarea"
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
                  {submitting ? 'Saving...' : editingDept ? 'Save Changes' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDepartments;
