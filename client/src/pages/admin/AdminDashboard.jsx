import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import {
  FaTachometerAlt,
  FaUsers,
  FaUserMd,
  FaHospital,
  FaCalendarCheck,
  FaCalendarDay,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaPlus,
  FaArrowRight,
} from 'react-icons/fa';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isSuperAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await api.get('/dashboard/admin');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        setError('Failed to fetch clinic analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>
        Loading clinic management dashboard...
      </div>
    );
  }

  const stats = data?.stats || {};
  const recent = data?.recentAppointments || [];

  return (
    <div>
      {/* Banner */}
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
        <div>
          <span style={{ fontSize: '0.8125rem', color: '#0d9488', fontWeight: '700', textTransform: 'uppercase' }}>
            {isSuperAdmin ? 'Administrator Executive Portal' : 'Receptionist Operations Console'}
          </span>
          <h1 style={{ fontSize: '1.75rem', color: '#0f172a', margin: '2px 0 6px' }}>
            CarePulse Clinic Overview
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
            Live status of consultations, medical departments, attending doctors, and patient registrations
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/admin/appointments" className="btn btn-primary">
            <FaCalendarCheck />
            <span>Manage Appointments</span>
          </Link>
          {isSuperAdmin && (
            <Link to="/admin/doctors/new" className="btn btn-secondary">
              <FaPlus />
              <span>Add Doctor</span>
            </Link>
          )}
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Main Metric Cards */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
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
            <FaUsers size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>{stats.totalPatients || 0}</div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Registered Patients</div>
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
            <FaUserMd size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>{stats.totalDoctors || 0}</div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Active Physicians</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#fef3c7',
            color: '#b45309',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <FaHospital size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>{stats.totalDepartments || 0}</div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Clinical Specialties</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#f1f5f9',
            color: '#334155',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <FaCalendarCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>{stats.totalAppointments || 0}</div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Total Bookings</div>
          </div>
        </div>
      </div>

      {/* Appointment Flow Cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: '500' }}>Today's Visits</span>
            <FaCalendarDay color="#0d9488" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', marginTop: '0.5rem' }}>
            {stats.todayAppointments || 0}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: '500' }}>Upcoming Active</span>
            <FaClock color="#0284c7" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', marginTop: '0.5rem' }}>
            {stats.upcomingAppointments || 0}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: '500' }}>Completed</span>
            <FaCheckCircle color="#16a34a" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', marginTop: '0.5rem' }}>
            {stats.completedAppointments || 0}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: '500' }}>Cancelled</span>
            <FaTimesCircle color="#dc2626" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', marginTop: '0.5rem' }}>
            {stats.cancelledAppointments || 0}
          </div>
        </div>
      </div>

      {/* Recent Clinic Activity */}
      <div className="card">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
        }}>
          <div>
            <h3 style={{ fontSize: '1.25rem' }}>Recent Booking Activity</h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>Latest outpatient appointment requests and status changes</p>
          </div>
          <Link to="/admin/appointments" className="btn btn-outline btn-sm">
            <span>View All ({stats.totalAppointments})</span>
            <FaArrowRight size={10} />
          </Link>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Patient</th>
                <th>Physician</th>
                <th>Department</th>
                <th>Appointment Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((apt) => (
                <tr key={apt._id}>
                  <td style={{ fontWeight: '700', color: '#0f172a' }}>{apt.appointmentReference}</td>
                  <td>{apt.patientId?.name || 'Patient'}</td>
                  <td>{apt.doctorId?.userId?.name || 'Doctor'}</td>
                  <td>
                    <span style={{ color: '#0d9488', fontWeight: '500' }}>
                      {apt.departmentId?.name || '-'}
                    </span>
                  </td>
                  <td>{apt.appointmentDate}</td>
                  <td>{apt.startTime}</td>
                  <td><StatusBadge status={apt.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
