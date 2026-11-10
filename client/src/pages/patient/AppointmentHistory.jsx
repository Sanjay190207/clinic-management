import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import {
  FaHistory,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaNotesMedical,
} from 'react-icons/fa';

const AppointmentHistory = () => {
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected appointment for viewing doctor notes
  const [selectedNotesApt, setSelectedNotesApt] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (statusFilter) params.append('status', statusFilter);

        const res = await api.get(`/appointments/my?${params.toString()}`);
        if (res.data.success) {
          setAppointments(res.data.appointments);
        }
      } catch (err) {
        setError('Failed to fetch appointment history.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [statusFilter]);

  const filteredAppointments = appointments.filter((apt) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const docMatch = apt.doctorId?.userId?.name?.toLowerCase().includes(term);
    const refMatch = apt.appointmentReference?.toLowerCase().includes(term);
    const deptMatch = apt.departmentId?.name?.toLowerCase().includes(term);
    return docMatch || refMatch || deptMatch;
  });

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>Appointment History</h1>
        <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
          Comprehensive record of all past, completed, and cancelled clinical consultations
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          alignItems: 'center',
        }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search reference, physician..."
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

          {/* Status Filter */}
          <div style={{ position: 'relative' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
              style={{ paddingLeft: '2.5rem' }}
            >
              <option value="">All Appointment Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Checked In">Checked In</option>
              <option value="Booked">Booked</option>
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

          {(statusFilter || searchTerm) && (
            <div>
              <button
                onClick={() => { setStatusFilter(''); setSearchTerm(''); }}
                className="btn btn-secondary btn-sm"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>
          Loading appointment records...
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <FaHistory size={40} color="#94a3b8" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Records Found</h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            No appointments match your search or filter parameters.
          </p>
          <Link to="/patient/doctors" className="btn btn-primary">
            Browse Doctors
          </Link>
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Physician</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Time Slot</th>
                  <th>Fee</th>
                  <th>Status</th>
                  <th>Doctor Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((apt) => (
                  <tr key={apt._id}>
                    <td style={{ fontWeight: '700', color: '#0f172a' }}>
                      {apt.appointmentReference}
                    </td>
                    <td>{apt.doctorId?.userId?.name || 'Doctor'}</td>
                    <td>
                      <span style={{ color: '#0d9488', fontWeight: '500' }}>
                        {apt.departmentId?.name || apt.doctorId?.departmentId?.name}
                      </span>
                    </td>
                    <td>{apt.appointmentDate}</td>
                    <td>{apt.startTime} – {apt.endTime}</td>
                    <td>${apt.consultationFee}</td>
                    <td><StatusBadge status={apt.status} /></td>
                    <td>
                      {apt.notes ? (
                        <button
                          type="button"
                          onClick={() => setSelectedNotesApt(apt)}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          <FaNotesMedical />
                          <span>View Notes</span>
                        </button>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Doctor Notes Modal Dialog */}
      {selectedNotesApt && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaNotesMedical color="#0d9488" />
              <span>Physician Consultation Notes</span>
            </h3>
            <div style={{
              backgroundColor: '#f8fafc',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              marginBottom: '1.25rem',
              fontSize: '0.875rem',
            }}>
              <div><strong>Physician:</strong> {selectedNotesApt.doctorId?.userId?.name}</div>
              <div><strong>Visit Date:</strong> {selectedNotesApt.appointmentDate} at {selectedNotesApt.startTime}</div>
              <div><strong>Reference:</strong> {selectedNotesApt.appointmentReference}</div>
            </div>
            <div style={{
              backgroundColor: '#ffffff',
              padding: '1.25rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.9375rem',
              color: '#334155',
              lineHeight: '1.6',
              marginBottom: '1.5rem',
            }}>
              {selectedNotesApt.notes}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedNotesApt(null)}
                className="btn btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentHistory;

