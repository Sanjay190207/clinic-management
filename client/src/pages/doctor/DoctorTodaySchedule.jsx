import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import {
  FaCalendarDay,
  FaUserCheck,
  FaCheckCircle,
  FaUserSlash,
  FaNotesMedical,
  FaFilter,
} from 'react-icons/fa';

const DoctorTodaySchedule = () => {
  const [appointments, setAppointments] = useState([]);
  const [todayDate, setTodayDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [error, setError] = useState('');

  // Status & Notes modal state
  const [selectedApt, setSelectedApt] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchTodayAppointments = async () => {
    try {
      const res = await api.get('/dashboard/doctor');
      if (res.data.success) {
        setAppointments(res.data.data.todayAppointments || []);
        setTodayDate(res.data.data.todayDate);
      }
    } catch (err) {
      setError('Failed to fetch today’s schedule.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayAppointments();
  }, []);

  const openModal = (apt, status) => {
    setSelectedApt(apt);
    setTargetStatus(status);
    setNotes(apt.notes || '');
    setModalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApt || !targetStatus) return;

    setSubmitting(true);
    setModalError('');

    try {
      const res = await api.patch(`/appointments/${selectedApt._id}/status`, {
        status: targetStatus,
        notes,
      });

      if (res.data.success) {
        setActionSuccess(`Patient ${selectedApt.patientId?.name} status updated to ${targetStatus}.`);
        setSelectedApt(null);
        fetchTodayAppointments();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = appointments.filter((apt) => {
    if (!filterStatus) return true;
    return apt.status === filterStatus;
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
          <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>Today's Patient Schedule</h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
            Live clinical patient queue for today: <strong>{todayDate}</strong>
          </p>
        </div>

        {/* Status filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaFilter color="#94a3b8" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '0.5rem 1rem' }}
          >
            <option value="">All Statuses ({appointments.length})</option>
            <option value="Booked">Booked</option>
            <option value="Checked In">Checked In</option>
            <option value="Completed">Completed</option>
            <option value="No Show">No Show</option>
          </select>
        </div>
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
          Loading schedule...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <FaCalendarDay size={40} color="#94a3b8" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Patients in this View</h3>
          <p style={{ color: '#64748b' }}>No appointments match your filter selection for today.</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time Slot</th>
                  <th>Patient</th>
                  <th>Phone</th>
                  <th>Consultation Reason</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((apt) => (
                  <tr key={apt._id}>
                    <td style={{ fontWeight: '700', color: '#0f172a' }}>
                      {apt.startTime} – {apt.endTime}
                    </td>
                    <td style={{ fontWeight: '600' }}>{apt.patientId?.name}</td>
                    <td>{apt.patientId?.phone || '-'}</td>
                    <td>{apt.reasonForVisit}</td>
                    <td><StatusBadge status={apt.status} /></td>
                    <td style={{ maxWidth: '200px', fontSize: '0.8125rem', color: '#475569' }}>
                      {apt.notes ? apt.notes.slice(0, 50) + (apt.notes.length > 50 ? '...' : '') : '-'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                        {apt.status === 'Booked' && (
                          <button
                            type="button"
                            onClick={() => openModal(apt, 'Checked In')}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                          >
                            <FaUserCheck color="#0d9488" />
                            <span>Check In</span>
                          </button>
                        )}
                        {['Booked', 'Checked In'].includes(apt.status) && (
                          <button
                            type="button"
                            onClick={() => openModal(apt, 'Completed')}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                          >
                            <FaCheckCircle />
                            <span>Complete</span>
                          </button>
                        )}
                        {['Booked', 'Checked In'].includes(apt.status) && (
                          <button
                            type="button"
                            onClick={() => openModal(apt, 'No Show')}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: '#64748b' }}
                          >
                            <FaUserSlash />
                            <span>No Show</span>
                          </button>
                        )}
                        {apt.status === 'Completed' && (
                          <button
                            type="button"
                            onClick={() => openModal(apt, 'Completed')}
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                          >
                            <FaNotesMedical />
                            <span>Edit Notes</span>
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

      {/* Modal */}
      {selectedApt && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              Update Consultation: <span style={{ color: '#0d9488' }}>{targetStatus}</span>
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Patient: <strong>{selectedApt.patientId?.name}</strong> &bull; Slot: {selectedApt.startTime}
            </p>

            {modalError && (
              <div className="alert alert-danger" style={{ fontSize: '0.8125rem', marginBottom: '1rem' }}>
                {modalError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Consultation Notes & Clinical Advice</label>
                <textarea
                  rows={4}
                  placeholder="Record patient diagnosis, prescribed medications, recommended tests..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedApt(null)}
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
                  {submitting ? 'Saving...' : `Save as ${targetStatus}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorTodaySchedule;
