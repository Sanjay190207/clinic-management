import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import {
  FaUsers,
  FaSearch,
  FaEnvelope,
  FaPhone,
  FaCalendarCheck,
  FaHistory,
} from 'react-icons/fa';

const ManagePatients = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Patient detail modal
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);

      const res = await api.get(`/patients?${params.toString()}`);
      if (res.data.success) {
        setPatients(res.data.patients);
      }
    } catch (err) {
      setError('Failed to fetch patient directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [searchTerm]);

  const viewPatientDetails = async (patient) => {
    setSelectedPatient(patient);
    setLoadingHistory(true);
    try {
      const res = await api.get(`/patients/${patient._id}`);
      if (res.data.success) {
        setPatientHistory(res.data.appointments || []);
      }
    } catch (err) {
      console.error('Failed to load patient history', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>Patient Directory</h1>
        <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
          Registered clinic patients, contact records, and consultation history
        </p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Search Input */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Search by patient name, email, or phone..."
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
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>
          Loading registered patients...
        </div>
      ) : patients.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <FaUsers size={40} color="#94a3b8" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Patients Found</h3>
          <p style={{ color: '#64748b' }}>No patient accounts match the search term.</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Email Address</th>
                  <th>Phone Number</th>
                  <th>Total Bookings</th>
                  <th>Registered On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: '700', color: '#0f172a' }}>{p.name}</td>
                    <td>{p.email}</td>
                    <td>{p.phone}</td>
                    <td>
                      <span style={{
                        backgroundColor: '#f0fdfa',
                        color: '#0f766e',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontWeight: '700',
                        fontSize: '0.8125rem',
                      }}>
                        {p.appointmentCount || 0} visits
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => viewPatientDetails(p)}
                        className="btn btn-outline btn-sm"
                      >
                        <FaHistory />
                        <span>History</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Patient History Modal */}
      {selectedPatient && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '720px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              Patient Record: <span style={{ color: '#0d9488' }}>{selectedPatient.name}</span>
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>
              {selectedPatient.email} &bull; {selectedPatient.phone}
            </p>

            {loadingHistory ? (
              <p style={{ textAlign: 'center', padding: '2rem 0', color: '#64748b' }}>
                Loading appointment records...
              </p>
            ) : patientHistory.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '2rem 0', color: '#64748b' }}>
                No appointments booked yet by this patient.
              </p>
            ) : (
              <div className="table-responsive" style={{ maxHeight: '340px', overflowY: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Ref</th>
                      <th>Physician</th>
                      <th>Date & Slot</th>
                      <th>Fee</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientHistory.map((apt) => (
                      <tr key={apt._id}>
                        <td style={{ fontWeight: '600' }}>{apt.appointmentReference}</td>
                        <td>{apt.doctorId?.userId?.name || 'Doctor'}</td>
                        <td>{apt.appointmentDate} ({apt.startTime})</td>
                        <td>${apt.consultationFee}</td>
                        <td><StatusBadge status={apt.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
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

export default ManagePatients;

