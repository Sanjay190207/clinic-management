import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import {
  FaCalendarCheck,
  FaSearch,
  FaFilter,
  FaUserCheck,
  FaCheckCircle,
  FaTimes,
  FaUserSlash,
  FaNotesMedical,
  FaTimesCircle,
} from 'react-icons/fa';

const ManageAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Filter states
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');
  const [error, setError] = useState('');

  // Status Modal state
  const [updatingApt, setUpdatingApt] = useState(null);
  const [nextStatus, setNextStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchDropdowns = async () => {
    try {
      const [docRes, deptRes] = await Promise.all([
        api.get('/doctors?all=true'),
        api.get('/departments?all=true'),
      ]);
      if (docRes.data.success) setDoctors(docRes.data.doctors);
      if (deptRes.data.success) setDepartments(deptRes.data.departments);
    } catch (err) {
      console.error('Failed to load filter dropdowns', err);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDate) params.append('date', selectedDate);
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedDoctor) params.append('doctorId', selectedDoctor);
      if (searchTerm) params.append('search', searchTerm);

      const res = await api.get(`/appointments?${params.toString()}`);
      if (res.data.success) {
        setAppointments(res.data.appointments);
      }
    } catch (err) {
      setError('Failed to fetch clinic appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate, selectedStatus, selectedDoctor, searchTerm]);

  const openStatusModal = (apt, target) => {
    setUpdatingApt(apt);
    setNextStatus(target);
    setNotes(apt.notes || '');
    setModalError('');
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!updatingApt || !nextStatus) return;

    setSubmitting(true);
    setModalError('');

    try {
      const res = await api.patch(`/appointments/${updatingApt._id}/status`, {
        status: nextStatus,
        notes,
      });

      if (res.data.success) {
        setActionSuccess(`Appointment ${updatingApt.appointmentReference} updated to ${nextStatus}.`);
        setUpdatingApt(null);
        fetchAppointments();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to update status.');
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
          <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>Appointment Master Console</h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
            Comprehensive management of all patient bookings, clinic check-ins, and consultation outcomes
          </p>
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

      {/* Filter Toolbar */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          alignItems: 'center',
        }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search reference, patient..."
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

          {/* Date Picker */}
          <div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Status Dropdown */}
          <div style={{ position: 'relative' }}>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="form-select"
              style={{ paddingLeft: '2.5rem' }}
            >
              <option value="">All Statuses</option>
              <option value="Booked">Booked</option>
              <option value="Checked In">Checked In</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="No Show">No Show</option>
            </select>
            <FaFilter style={{
              position: 'absolute',
              left: '0.875rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
            }} />
          </div>

          {/* Doctor Dropdown */}
          <div>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="form-select"
            >
              <option value="">All Physicians</option>
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.userId?.name} ({d.departmentId?.name})
                </option>
              ))}
            </select>
          </div>

          {/* Reset button */}
          {(selectedDate || selectedStatus || selectedDoctor || searchTerm) && (
            <div>
              <button
                type="button"
                onClick={() => {
                  setSelectedDate('');
                  setSelectedStatus('');
                  setSelectedDoctor('');
                  setSearchTerm('');
                }}
                className="btn btn-secondary btn-sm"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Appointment Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>
          Loading clinic appointments...
        </div>
      ) : appointments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <FaCalendarCheck size={40} color="#94a3b8" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Appointments Found</h3>
          <p style={{ color: '#64748b' }}>No records match your selected date or filter parameters.</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ref Number</th>
                  <th>Patient</th>
                  <th>Physician</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Time Slot</th>
                  <th>Fee</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt._id}>
                    <td style={{ fontWeight: '700', color: '#0f172a' }}>
                      {apt.appointmentReference}
                    </td>
                    <td>
                      <div>{apt.patientId?.name || 'Patient'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{apt.patientId?.phone}</div>
                    </td>
                    <td>{apt.doctorId?.userId?.name || 'Doctor'}</td>
                    <td>
                      <span style={{ color: '#0d9488', fontWeight: '500' }}>
                        {apt.departmentId?.name || apt.doctorId?.departmentId?.name || '-'}
                      </span>
                    </td>
                    <td>{apt.appointmentDate}</td>
                    <td>{apt.startTime}</td>
                    <td>${apt.consultationFee}</td>
                    <td><StatusBadge status={apt.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                        {apt.status === 'Booked' && (
                          <button
                            type="button"
                            onClick={() => openStatusModal(apt, 'Checked In')}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                            title="Check In Patient at Reception"
                          >
                            <FaUserCheck color="#0d9488" />
                            <span>Check In</span>
                          </button>
                        )}
                        {['Booked', 'Checked In'].includes(apt.status) && (
                          <button
                            type="button"
                            onClick={() => openStatusModal(apt, 'Completed')}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                            title="Complete Consultation"
                          >
                            <FaCheckCircle />
                            <span>Complete</span>
                          </button>
                        )}
                        {['Booked', 'Checked In'].includes(apt.status) && (
                          <button
                            type="button"
                            onClick={() => openStatusModal(apt, 'No Show')}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                            title="Mark Patient No-Show"
                          >
                            <FaUserSlash />
                          </button>
                        )}
                        {['Booked', 'Checked In'].includes(apt.status) && (
                          <button
                            type="button"
                            onClick={() => openStatusModal(apt, 'Cancelled')}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: '#dc2626' }}
                            title="Cancel Appointment"
                          >
                            <FaTimes />
                          </button>
                        )}
                        {apt.notes && (
                          <button
                            type="button"
                            onClick={() => openStatusModal(apt, apt.status)}
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                            title="View/Edit Notes"
                          >
                            <FaNotesMedical />
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

      {/* Status Modal */}
      {updatingApt && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              Update Appointment: <span style={{ color: '#0d9488' }}>{nextStatus}</span>
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Ref: <strong>{updatingApt.appointmentReference}</strong> &bull; Patient: {updatingApt.patientId?.name}
            </p>

            {modalError && (
              <div className="alert alert-danger" style={{ fontSize: '0.8125rem', marginBottom: '1rem' }}>
                {modalError}
              </div>
            )}

            <form onSubmit={handleStatusSubmit}>
              <div className="form-group">
                <label className="form-label">Internal Reception / Clinical Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes, cancellation reasoning, or check-in instructions..."
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setUpdatingApt(null)}
                  disabled={submitting}
                  className="btn btn-secondary"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? 'Updating...' : `Set Status to ${nextStatus}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAppointments;

