import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaTachometerAlt,
  FaUserMd,
  FaCalendarAlt,
  FaHistory,
  FaUser,
  FaHospital,
  FaUsers,
  FaCalendarCheck,
  FaClock,
  FaUserShield,
  FaPlusCircle,
  FaCalendarDay,
  FaCalendarWeek,
} from 'react-icons/fa';

const Sidebar = () => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  // Nav item style generator
  const getNavClass = ({ isActive }) =>
    `sidebar-link ${isActive ? 'active' : ''}`;

  return (
    <aside style={{
      width: '260px',
      backgroundColor: '#ffffff',
      borderRight: '1px solid #e2e8f0',
      minHeight: 'calc(100vh - 72px)',
      padding: '1.5rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    }}>
      {/* Role Tag & Greeting */}
      <div style={{
        padding: '0.75rem 1rem',
        marginBottom: '1rem',
        backgroundColor: '#f0fdfa',
        borderRadius: '10px',
        border: '1px solid #ccfbf1',
      }}>
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#0d9488', fontWeight: '700' }}>
          Portal Access
        </div>
        <div style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#0f172a' }}>
          {role === 'patient' && 'Patient Portal'}
          {role === 'doctor' && 'Physician Portal'}
          {role === 'admin' && 'Administrator Portal'}
          {role === 'receptionist' && 'Receptionist Console'}
        </div>
      </div>

      {/* Navigation Links by Role */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', flex: 1 }}>
        {/* PATIENT LINKS */}
        {role === 'patient' && (
          <>
            <NavLink to="/patient/dashboard" className={getNavClass}>
              <FaTachometerAlt />
              <span>Overview</span>
            </NavLink>
            <NavLink to="/patient/doctors" className={getNavClass}>
              <FaUserMd />
              <span>Browse Doctors</span>
            </NavLink>
            <NavLink to="/patient/appointments" className={getNavClass}>
              <FaCalendarCheck />
              <span>My Appointments</span>
            </NavLink>
            <NavLink to="/patient/history" className={getNavClass}>
              <FaHistory />
              <span>Appointment History</span>
            </NavLink>
            <NavLink to="/patient/profile" className={getNavClass}>
              <FaUser />
              <span>My Profile</span>
            </NavLink>
          </>
        )}

        {/* DOCTOR LINKS */}
        {role === 'doctor' && (
          <>
            <NavLink to="/doctor/dashboard" className={getNavClass}>
              <FaTachometerAlt />
              <span>Doctor Dashboard</span>
            </NavLink>
            <NavLink to="/doctor/today" className={getNavClass}>
              <FaCalendarDay />
              <span>Today's Schedule</span>
            </NavLink>
            <NavLink to="/doctor/weekly" className={getNavClass}>
              <FaCalendarWeek />
              <span>Weekly Schedule</span>
            </NavLink>
            <NavLink to="/doctor/profile" className={getNavClass}>
              <FaUserMd />
              <span>Doctor Profile</span>
            </NavLink>
          </>
        )}

        {/* ADMIN & RECEPTIONIST LINKS */}
        {['admin', 'receptionist'].includes(role) && (
          <>
            <NavLink to="/admin/dashboard" className={getNavClass}>
              <FaTachometerAlt />
              <span>Overview Stats</span>
            </NavLink>
            <NavLink to="/admin/appointments" className={getNavClass}>
              <FaCalendarCheck />
              <span>Appointments</span>
            </NavLink>
            <NavLink to="/admin/doctors" className={getNavClass}>
              <FaUserMd />
              <span>Manage Doctors</span>
            </NavLink>
            {role === 'admin' && (
              <NavLink to="/admin/doctors/new" className={getNavClass}>
                <FaPlusCircle />
                <span>Add Doctor</span>
              </NavLink>
            )}
            <NavLink to="/admin/departments" className={getNavClass}>
              <FaHospital />
              <span>Departments</span>
            </NavLink>
            <NavLink to="/admin/patients" className={getNavClass}>
              <FaUsers />
              <span>Patients Directory</span>
            </NavLink>
            <NavLink to="/admin/working-hours" className={getNavClass}>
              <FaClock />
              <span>Working Hours</span>
            </NavLink>

            {/* Privileged User Management (Strictly Admin only) */}
            {role === 'admin' && (
              <NavLink to="/admin/users" className={getNavClass}>
                <FaUserShield />
                <span>User Accounts</span>
              </NavLink>
            )}
          </>
        )}
      </nav>

      <style>{`
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          color: #475569;
          font-weight: 500;
          font-size: 0.875rem;
          text-decoration: none;
          transition: all 0.2s;
        }
        .sidebar-link:hover {
          background-color: #f1f5f9;
          color: #0f172a;
        }
        .sidebar-link.active {
          background-color: #0d9488;
          color: #ffffff;
          box-shadow: 0 2px 6px rgba(13, 148, 136, 0.3);
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
