import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import {
  FaClock,
  FaUserMd,
  FaCheckCircle,
  FaEdit,
} from 'react-icons/fa';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const dayIndexMap = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 0,
};

const ManageWorkingHours = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDoctorId = searchParams.get('doctorId') || '';

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(initialDoctorId);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [error, setError] = useState('');

  // Edit Day Modal state
  const [editingDay, setEditingDay] = useState(null);
  const [editForm, setEditForm] = useState({
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 30,
    breakStart: '13:00',
    breakEnd: '14:00',
    isAvailable: true,
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // 1. Fetch all doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get('/doctors?all=true');
        if (res.data.success && res.data.doctors.length > 0) {
          setDoctors(res.data.doctors);
          if (!selectedDoctorId) {
            setSelectedDoctorId(res.data.doctors[0]._id);
          }
        }
      } catch (err) {
        setError('Failed to fetch doctor directory.');
      }
    };
    fetchDoctors();
  }, []);

  // 2. Fetch selected doctor's availability schedules
  const fetchDoctorSchedules = async () => {
    if (!selectedDoctorId) return;

    setLoading(true);
    setError('');
    setActionSuccess('');

    try {
      const res = await api.get(`/doctors/${selectedDoctorId}/availability`);
      if (res.data.success) {
        setSchedules(res.data.availability || []);
      }
    } catch (err) {
      setError('Failed to load doctor schedules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorSchedules();
    if (selectedDoctorId) {
      setSearchParams({ doctorId: selectedDoctorId });
    }
  }, [selectedDoctorId]);

  const startEdit = (dayName) => {
    const dayOfWeek = dayIndexMap[dayName];
    const existing = schedules.find((s) => s.dayOfWeek === dayOfWeek);

    setEditingDay(dayName);
    setSaveError('');
    if (existing) {
      setEditForm({
        startTime: existing.startTime,
        endTime: existing.endTime,
        slotDuration: existing.slotDuration,
        breakStart: existing.breakPeriods?.[0]?.startTime || '13:00',
        breakEnd: existing.breakPeriods?.[0]?.endTime || '14:00',
        isAvailable: existing.isAvailable,
      });
    } else {
      setEditForm({
        startTime: '09:00',
        endTime: '17:00',
        slotDuration: 30,
        breakStart: '13:00',
        breakEnd: '14:00',
        isAvailable: false,
      });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId || !editingDay) return;

    setSaving(true);
    setSaveError('');

    try {
      const dayOfWeek = dayIndexMap[editingDay];
      const payload = {
        dayOfWeek,
        startTime: editForm.startTime,
        endTime: editForm.endTime,
        slotDuration: Number(editForm.slotDuration),
        isAvailable: editForm.isAvailable,
        breakPeriods: editForm.breakStart && editForm.breakEnd
          ? [{ startTime: editForm.breakStart, endTime: editForm.breakEnd, reason: 'Lunch Break' }]
          : [],
      };

      const res = await api.post(`/doctors/${selectedDoctorId}/availability`, payload);
      if (res.data.success) {
        setActionSuccess(`Operating schedule for ${editingDay} saved successfully.`);
        setEditingDay(null);
        fetchDoctorSchedules();
      }
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to save working hours.');
    } finally {
      setSaving(false);
    }
  };

  const selectedDoctorObj = doctors.find((d) => d._id === selectedDoctorId);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>Working Hours & Slot Generation</h1>
        <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
          Configure physician daily shift times, consultation slot durations, and protected lunch break intervals
        </p>
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

      {/* Select Doctor Bar */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0d9488', fontWeight: '600' }}>
            <FaUserMd />
            <span>Select Physician:</span>
          </div>

          <div style={{ flex: 1, minWidth: '260px' }}>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="form-select"
            >
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.userId?.name} – {d.departmentId?.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Weekly Schedule Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>
          Loading schedule data...
        </div>
      ) : (
        <div className="card">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '1rem',
            marginBottom: '1rem',
          }}>
            <div>
              <h3 style={{ fontSize: '1.125rem' }}>
                Weekly Schedule for {selectedDoctorObj?.userId?.name || 'Physician'}
              </h3>
              <span style={{ fontSize: '0.8125rem', color: '#0d9488', fontWeight: '600' }}>
                {selectedDoctorObj?.departmentId?.name} Department
              </span>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Availability</th>
                  <th>Working Hours</th>
                  <th>Slot Duration</th>
                  <th>Lunch / Break Period</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {days.map((dayName) => {
                  const dayOfWeek = dayIndexMap[dayName];
                  const sched = schedules.find((s) => s.dayOfWeek === dayOfWeek);
                  const isAvail = sched && sched.isAvailable;

                  return (
                    <tr key={dayName}>
                      <td style={{ fontWeight: '700', color: '#0f172a' }}>{dayName}</td>
                      <td>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          backgroundColor: isAvail ? '#dcfce7' : '#f1f5f9',
                          color: isAvail ? '#15803d' : '#64748b',
                        }}>
                          {isAvail ? 'Available' : 'Day Off'}
                        </span>
                      </td>
                      <td>
                        {isAvail ? (
                          <span style={{ fontWeight: '600', color: '#0f766e' }}>
                            {sched.startTime} – {sched.endTime}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>—</span>
                        )}
                      </td>
                      <td>{isAvail ? `${sched.slotDuration} mins` : '—'}</td>
                      <td>
                        {isAvail && sched.breakPeriods?.length > 0 ? (
                          <span style={{ color: '#b45309', fontSize: '0.8125rem' }}>
                            {sched.breakPeriods[0].startTime} – {sched.breakPeriods[0].endTime}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>None</span>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => startEdit(dayName)}
                          className="btn btn-secondary btn-sm"
                        >
                          <FaEdit />
                          <span>Configure</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingDay && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              Configure Working Hours: <span style={{ color: '#0d9488' }}>{editingDay}</span>
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Doctor: <strong>{selectedDoctorObj?.userId?.name}</strong>
            </p>

            {saveError && (
              <div className="alert alert-danger" style={{ fontSize: '0.8125rem', marginBottom: '1rem' }}>
                {saveError}
              </div>
            )}

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={editForm.isAvailable}
                    onChange={(e) => setEditForm({ ...editForm, isAvailable: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#0d9488' }}
                  />
                  <span style={{ fontWeight: '600', color: '#0f172a' }}>Physician is available for appointments</span>
                </label>
              </div>

              {editForm.isAvailable && (
                <>
                  <div className="grid-2" style={{ gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Shift Start (HH:mm)</label>
                      <input
                        type="time"
                        value={editForm.startTime}
                        onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Shift End (HH:mm)</label>
                      <input
                        type="time"
                        value={editForm.endTime}
                        onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
                        required
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Slot Duration (Minutes)</label>
                    <select
                      value={editForm.slotDuration}
                      onChange={(e) => setEditForm({ ...editForm, slotDuration: Number(e.target.value) })}
                      className="form-select"
                    >
                      <option value={15}>15 Minutes</option>
                      <option value={20}>20 Minutes</option>
                      <option value={30}>30 Minutes</option>
                      <option value={45}>45 Minutes</option>
                      <option value={60}>60 Minutes</option>
                    </select>
                  </div>

                  <div className="grid-2" style={{ gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Lunch Break Start</label>
                      <input
                        type="time"
                        value={editForm.breakStart}
                        onChange={(e) => setEditForm({ ...editForm, breakStart: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Lunch Break End</label>
                      <input
                        type="time"
                        value={editForm.breakEnd}
                        onChange={(e) => setEditForm({ ...editForm, breakEnd: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingDay(null)}
                  disabled={saving}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                >
                  {saving ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageWorkingHours;

