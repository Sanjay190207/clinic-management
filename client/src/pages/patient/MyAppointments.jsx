import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import {
  FaCalendarCheck,
  FaTimes,
  FaExclamationTriangle,
  FaCheckCircle,
  FaCalendarPlus,
  FaUserMd,
} from 'react-icons/fa';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Cancellation Modal state
  const [cancellingAppt, setCancellingAppt] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/appointments/my?upcoming=true');
      if (res.data.success) {
        setAppointments(res.data.appointments);
      }
    } catch (err) {
      setError('Failed to fetch upcoming appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancellingAppt) return;

    setCancelSubmitting(true);
    setCancelError('');

    try {
      const res = await api.patch(`/appointments/${cancellingAppt._id}/cancel`, {
        reason: cancelReason || 'Cancelled by patient',
      });

      if (res.data.success) {
        setActionSuccess(`Appointment ${cancellingAppt.appointmentReference} has been cancelled successfully.`);
        setCancellingAppt(null);
        setCancelReason('');
        fetchAppointments();
      }
    } catch (err) {
      setCancelError(err.response?.data?.message || 'Unable to cancel appointment. Check cutoff policy.');
    } finally {
      setCancelSubmitting(false);
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
          <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>My Scheduled Appointments</h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
            Review your active upcoming clinic consultations and manage booking cancellations
          </p>
        </div>

        <Link to="/patient/doctors" className="btn btn-primary">
          <FaCalendarPlus />
          <span>Book New Appointment</span>
        </Link>
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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>
          Loading your appointments...
        </div>
      ) : appointments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <FaCalendarCheck size={40} color="#94a3b8" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Upcoming Appointments</h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem', maxWidth: '440px', margin: '0 auto 1.5rem' }}>
            You do not have any active upcoming doctor appointments scheduled. Check our directory to book a visit.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link to="/patient/doctors" className="btn btn-primary">
              Browse Doctors
            </Link>
            <Link to="/patient/history" className="btn btn-secondary">
              View Past History
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {appointments.map((apt) => (
            <div key={apt._id} className="card" style={{ padding: '1.5rem' }}>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                borderBottom: '1px solid #f1f5f9',
                paddingBottom: '1rem',
                marginBottom: '1rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Ref:</span>
                  <span style={{ fontSize: '1.125rem', fontWeight: '800', color: '#0f172a' }}>
                    {apt.appointmentReference}
                  </span>
                </div>
                <StatusBadge status={apt.status} />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.25rem',
                alignItems: 'center',
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Physician</span>
                  <div style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>
                    {apt.doctorId?.userId?.name || 'Assigned Doctor'}
                  </div>
                  <span style={{ fontSize: '0.8125rem', color: '#0d9488', fontWeight: '600' }}>
                    {apt.doctorId?.departmentId?.name}
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Scheduled Slot</span>
                  <div style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>
                    {apt.appointmentDate}
                  </div>
                  <span style={{ fontSize: '0.875rem', color: '#475569' }}>
                    {apt.startTime} – {apt.endTime}
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Visit Reason</span>
                  <div style={{ fontSize: '0.875rem', color: '#334155' }}>
                    {apt.reasonForVisit || 'General Consultation'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Consultation Fee</span>
                  <div style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0f172a' }}>
                    ${apt.consultationFee}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  {apt.status === 'Booked' && (
                    <button
                      type="button"
                      onClick={() => {
                        setCancellingAppt(apt);
                        setCancelError('');
                        setCancelReason('');
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#dc2626', borderColor: '#fecaca' }}
                    >
                      <FaTimes />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancellation Modal Dialog */}
      {cancellingAppt && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <FaExclamationTriangle size={18} />
              </div>
              <h3 style={{ fontSize: '1.25rem', color: '#0f172a' }}>Cancel Appointment</h3>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '1rem', lineHeight: '1.5' }}>
              Are you sure you want to cancel appointment <strong>{cancellingAppt.appointmentReference}</strong> with {cancellingAppt.doctorId?.userId?.name} on {cancellingAppt.appointmentDate} at {cancellingAppt.startTime}?
            </p>

            <div style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '8px',
              padding: '0.75rem',
              fontSize: '0.8125rem',
              color: '#92400e',
              marginBottom: '1.25rem',
            }}>
              <strong>Cancellation Policy:</strong> Cancellations must be made at least 2 hours prior to scheduled appointment time.
            </div>

            {cancelError && (
              <div className="alert alert-danger" style={{ marginBottom: '1rem', fontSize: '0.8125rem' }}>
                {cancelError}
              </div>
            )}

            <form onSubmit={handleCancelSubmit}>
              <div className="form-group">
                <label className="form-label">Reason for cancellation (optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Schedule conflict, feeling better..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setCancellingAppt(null)}
                  disabled={cancelSubmitting}
                  className="btn btn-secondary"
                >
                  Keep Appointment
                </button>
                <button
                  type="submit"
                  disabled={cancelSubmitting}
                  className="btn btn-danger"
                >
                  {cancelSubmitting ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
