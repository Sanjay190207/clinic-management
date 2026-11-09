import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import {
  FaCalendarCheck,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaUserMd,
  FaClock,
  FaArrowRight,
  FaHospital,
} from 'react-icons/fa';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/patient');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        setError('Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <p style={{ color: '#64748b' }}>Loading your patient dashboard...</p>
      </div>
    );
  }

  const stats = data?.stats || { total: 0, upcoming: 0, completed: 0, cancelled: 0 };
  const nextAppt = data?.nextAppointment;
  const recent = data?.recentAppointments || [];

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
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
      }}>
        <div>
          <span style={{ fontSize: '0.8125rem', color: '#0d9488', fontWeight: '700', textTransform: 'uppercase' }}>
            Patient Portal
          </span>
          <h1 style={{ fontSize: '1.75rem', color: '#0f172a', margin: '4px 0 8px' }}>
            Welcome back, {user?.name}!
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
            Manage your scheduled clinic appointments, review doctor instructions, and book new consultations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/patient/doctors" className="btn btn-primary">
            <FaCalendarCheck />
            <span>Book New Appointment</span>
          </Link>
          <Link to="/patient/appointments" className="btn btn-secondary">
            <span>View All</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
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
            <FaCalendarAlt size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>{stats.total}</div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Total Bookings</div>
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
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>{stats.upcoming}</div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Upcoming Active</div>
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
            <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Completed Visits</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <FaTimesCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>{stats.cancelled}</div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Cancelled</div>
          </div>
        </div>
      </div>

      {/* Next Appointment Spotlight Card */}
      {nextAppt ? (
        <div className="card" style={{
          backgroundColor: '#f0fdfa',
          borderColor: '#99f6e4',
          marginBottom: '2rem',
          padding: '1.75rem',
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            borderBottom: '1px solid #ccfbf1',
            paddingBottom: '1rem',
            marginBottom: '1.25rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaCalendarCheck color="#0d9488" size={18} />
              <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0f766e', textTransform: 'uppercase' }}>
                Your Next Appointment
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.8125rem', color: '#475569' }}>Ref: <strong>{nextAppt.appointmentReference}</strong></span>
              <StatusBadge status={nextAppt.status} />
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            alignItems: 'center',
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Attending Physician</span>
              <div style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0f172a' }}>
                {nextAppt.doctorId?.userId?.name || 'Assigned Doctor'}
              </div>
              <span style={{ fontSize: '0.8125rem', color: '#0d9488', fontWeight: '600' }}>
                {nextAppt.doctorId?.departmentId?.name || 'Department'}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Scheduled Date & Time</span>
              <div style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0f172a' }}>
                {nextAppt.appointmentDate}
              </div>
              <span style={{ fontSize: '0.875rem', color: '#475569' }}>
                {nextAppt.startTime} – {nextAppt.endTime}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Consultation Reason</span>
              <div style={{ fontSize: '0.9375rem', color: '#334155' }}>
                {nextAppt.reasonForVisit || 'General Consultation'}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <Link to="/patient/appointments" className="btn btn-primary btn-sm">
                Manage Appointment
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ marginBottom: '2rem', textAlign: 'center', padding: '2.5rem 1.5rem' }}>
          <FaCalendarCheck size={36} color="#94a3b8" style={{ marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No Upcoming Appointments</h3>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            You do not have any active upcoming doctor appointments scheduled.
          </p>
          <Link to="/patient/doctors" className="btn btn-primary btn-sm">
            Book an Appointment Now
          </Link>
        </div>
      )}

      {/* Recent Appointments Table */}
      <div className="card">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
        }}>
          <div>
            <h3 style={{ fontSize: '1.125rem' }}>Recent Appointment Activity</h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>Your latest consultation bookings and visits</p>
          </div>
          <Link to="/patient/history" style={{ fontSize: '0.875rem', color: '#0d9488', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span>Full History</span>
            <FaArrowRight size={10} />
          </Link>
        </div>

        {recent.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>
            No past appointment records found.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Doctor</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Fee</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((apt) => (
                  <tr key={apt._id}>
                    <td style={{ fontWeight: '600', color: '#0f172a' }}>{apt.appointmentReference}</td>
                    <td>{apt.doctorId?.userId?.name || 'Doctor'}</td>
                    <td>{apt.doctorId?.departmentId?.name || '-'}</td>
                    <td>{apt.appointmentDate}</td>
                    <td>{apt.startTime}</td>
                    <td>${apt.consultationFee}</td>
                    <td><StatusBadge status={apt.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
