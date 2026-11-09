import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import {
  FaCheckCircle,
  FaCalendarCheck,
  FaUserMd,
  FaPrint,
  FaArrowRight,
  FaClock,
  FaHospital,
} from 'react-icons/fa';

const AppointmentConfirmation = () => {
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await api.get(`/appointments/${id}`);
        if (res.data.success) {
          setAppointment(res.data.appointment);
        }
      } catch (err) {
        setError('Failed to load appointment details.');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <p style={{ color: '#64748b' }}>Loading appointment confirmation...</p>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="card" style={{ maxWidth: '500px', margin: '2rem auto', textAlign: 'center', padding: '2.5rem' }}>
        <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>Confirmation Not Found</h3>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{error || 'Unable to retrieve booking details.'}</p>
        <Link to="/patient/appointments" className="btn btn-primary">
          Go to My Appointments
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div className="card" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#dcfce7',
          color: '#16a34a',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
        }}>
          <FaCheckCircle size={32} />
        </div>

        <h1 style={{ fontSize: '1.75rem', color: '#0f172a', marginBottom: '0.5rem' }}>
          Appointment Confirmed!
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9375rem', marginBottom: '1.5rem' }}>
          Your appointment has been successfully scheduled with CarePulse Clinic.
        </p>

        {/* Reference Highlight */}
        <div style={{
          backgroundColor: '#f0fdfa',
          border: '1px solid #99f6e4',
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '2rem',
        }}>
          <span style={{ fontSize: '0.75rem', color: '#0f766e', fontWeight: '700', textTransform: 'uppercase' }}>
            Unique Appointment Reference
          </span>
          <div style={{
            fontSize: '1.625rem',
            fontWeight: '800',
            color: '#0f172a',
            letterSpacing: '0.05em',
            margin: '4px 0',
          }}>
            {appointment.appointmentReference}
          </div>
          <span style={{ fontSize: '0.8125rem', color: '#475569' }}>
            Please present this reference number when checking in at reception.
          </span>
        </div>

        {/* Details List */}
        <div style={{
          textAlign: 'left',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          padding: '1.25rem',
          border: '1px solid #e2e8f0',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.875rem',
          fontSize: '0.9375rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.625rem' }}>
            <span style={{ color: '#64748b' }}>Physician:</span>
            <strong style={{ color: '#0f172a' }}>{appointment.doctorId?.userId?.name}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.625rem' }}>
            <span style={{ color: '#64748b' }}>Department:</span>
            <span style={{ color: '#0d9488', fontWeight: '600' }}>{appointment.departmentId?.name}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.625rem' }}>
            <span style={{ color: '#64748b' }}>Date & Time:</span>
            <strong style={{ color: '#0f172a' }}>{appointment.appointmentDate} at {appointment.startTime} – {appointment.endTime}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.625rem' }}>
            <span style={{ color: '#64748b' }}>Patient:</span>
            <span>{appointment.patientId?.name} ({appointment.patientId?.phone})</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.625rem' }}>
            <span style={{ color: '#64748b' }}>Reason:</span>
            <span>{appointment.reasonForVisit || 'General Consultation'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#64748b' }}>Status:</span>
            <StatusBadge status={appointment.status} />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => window.print()}
            className="btn btn-secondary"
          >
            <FaPrint />
            <span>Print Confirmation</span>
          </button>
          <Link to="/patient/appointments" className="btn btn-primary">
            <span>View My Appointments</span>
            <FaArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AppointmentConfirmation;
