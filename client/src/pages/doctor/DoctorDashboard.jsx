import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import {
  FaUserMd,
  FaCalendarDay,
  FaCalendarWeek,
  FaCheckCircle,
  FaClock,
  FaUserCheck,
  FaUserSlash,
  FaNotesMedical,
  FaExclamationCircle,
} from 'react-icons/fa';

const DoctorDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Status Update Modal state
  const [updatingApt, setUpdatingApt] = useState(null);
  const [nextStatus, setNextStatus] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);
  const [statusError, setStatusError] = useState('');

  const fetchDoctorDashboard = async () => {
    try {
      const res = await api.get('/dashboard/doctor');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load physician dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorDashboard();
  }, []);

  const openStatusModal = (apt, targetStatus) => {
    setUpdatingApt(apt);
    setNextStatus(targetStatus);
    setDoctorNotes(apt.notes || '');
    setStatusError('');
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!updatingApt || !nextStatus) return;

    setSubmittingStatus(true);
    setStatusError('');

    try {
      const res = await api.patch(`/appointments/${updatingApt._id}/status`, {
        status: nextStatus,
        notes: doctorNotes,
      });

      if (res.data.success) {
        setActionSuccess(`Appointment ${updatingApt.appointmentReference} status updated to ${nextStatus}.`);
        setUpdatingApt(null);
        fetchDoctorDashboard();
      }
    } catch (err) {
      setStatusError(err.response?.data?.message || 'Failed to update appointment status.');
    } finally {
      setSubmittingStatus(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>
        Loading physician dashboard...
      </div>
    );
  }

  const doctor = data?.doctor;
  const stats = data?.stats || { total: 0, today: 0, completed: 0, pending: 0 };
  const todayAppointments = data?.todayAppointments || [];
  const upcomingAppointments = data?.upcomingAppointments || [];

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '2rem',
        border: '1px solid #e2e8f0',
        marginBottom: '2rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem',
      }}>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <img
            src={doctor?.profileImage || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80'}
            alt={doctor?.userId?.name}
            style={{ width: '70px', height: '70px', borderRadius: '16px', objectFit: 'cover', border: '2px solid #0d9488' }}
          />
          <div>
            <span style={{ fontSize: '0.8125rem', color: '#0d9488', fontWeight: '700', textTransform: 'uppercase' }}>
              Physician Portal &bull; {doctor?.departmentId?.name}
            </span>
            <h1 style={{ fontSize: '1.75rem', color: '#0f172a', margin: '2px 0 6px' }}>
              {doctor?.userId?.name}
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              {doctor?.qualification} &bull; {doctor?.experience} yrs exp &bull; Consultation Fee: ${doctor?.consultationFee}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/doctor/today" className="btn btn-primary">
            <FaCalendarDay />
            <span>Today's Queue ({todayAppointments.length})</span>
          </Link>
          <Link to="/doctor/weekly" className="btn btn-secondary">
            <FaCalendarWeek />
            <span>Weekly Schedule</span>
          </Link>
        </div>
      </div>

      {actionSuccess && (
        <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <FaCheckCircle size={18} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#f0fdfa',
            color: '#0d9488',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <FaCalendarDay size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>{stats.today}</div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Today's Patients</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#e0f2fe',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <FaClock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>{stats.pending}</div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Pending / In-Queue</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#dcfce7',
            color: '#16a34a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <FaCheckCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>{stats.completed}</div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Completed Consultations</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#f1f5f9',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <FaUserMd size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>{stats.total}</div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Lifetime Appointments</div>
          </div>
        </div>
      </div>

      {/* Today's Schedule Table */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
        }}>
          <div>
            <h3 style={{ fontSize: '1.25rem' }}>Today's Scheduled Consultations</h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              Date: <strong>{data?.todayDate}</strong> &bull; Update status as patients arrive and consultations finish
            </p>
          </div>
          <Link to="/doctor/today" className="btn btn-outline btn-sm">
            Full Patient Queue
          </Link>
        </div>

        {todayAppointments.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0', fontSize: '0.875rem' }}>
            No patient appointments scheduled for today.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time Slot</th>
                  <th>Patient Name</th>
                  <th>Contact Phone</th>
                  <th>Visit Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {todayAppointments.map((apt) => (
                  <tr key={apt._id}>
                    <td style={{ fontWeight: '700', color: '#0f172a' }}>
                      {apt.startTime} – {apt.endTime}
                    </td>
                    <td style={{ fontWeight: '600' }}>{apt.patientId?.name || 'Patient'}</td>
                    <td>{apt.patientId?.phone || '-'}</td>
                    <td>{apt.reasonForVisit}</td>
                    <td><StatusBadge status={apt.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                        {apt.status === 'Booked' && (
                          <button
                            type="button"
                            onClick={() => openStatusModal(apt, 'Checked In')}
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
                            onClick={() => openStatusModal(apt, 'Completed')}
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
                            onClick={() => openStatusModal(apt, 'No Show')}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: '#64748b' }}
                          >
                            <FaUserSlash />
                            <span>No Show</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upcoming Appointments */}
      <div className="card">
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Upcoming Appointments (Next 10)</h3>
        <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '1.25rem' }}>
          Future scheduled visits booked by patients across upcoming clinic operating days
        </p>

        {upcomingAppointments.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0', fontSize: '0.875rem' }}>
            No upcoming appointments in the immediate pipeline.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time Slot</th>
                  <th>Reference</th>
                  <th>Patient Name</th>
                  <th>Phone</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {upcomingAppointments.map((apt) => (
                  <tr key={apt._id}>
                    <td style={{ fontWeight: '600' }}>{apt.appointmentDate}</td>
                    <td>{apt.startTime}</td>
                    <td>{apt.appointmentReference}</td>
                    <td>{apt.patientId?.name}</td>
                    <td>{apt.patientId?.phone}</td>
                    <td>{apt.reasonForVisit}</td>
                    <td><StatusBadge status={apt.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Doctor Status & Notes Modal Dialog */}
      {updatingApt && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#0f172a' }}>
              Update Appointment to: <span style={{ color: '#0d9488' }}>{nextStatus}</span>
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Patient: <strong>{updatingApt.patientId?.name}</strong> &bull; Slot: {updatingApt.startTime} ({updatingApt.appointmentDate})
            </p>

            {statusError && (
              <div className="alert alert-danger" style={{ fontSize: '0.8125rem', marginBottom: '1rem' }}>
                {statusError}
              </div>
            )}

            <form onSubmit={handleStatusSubmit}>
              <div className="form-group">
                <label className="form-label">Consultation Notes / Instructions for Patient</label>
                <textarea
                  rows={4}
                  placeholder="Record blood pressure, clinical findings, advised prescriptions, and rest guidelines..."
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setUpdatingApt(null)}
                  disabled={submittingStatus}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingStatus}
                  className="btn btn-primary"
                >
                  {submittingStatus ? 'Saving...' : `Confirm ${nextStatus}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;

