import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  FaCalendarWeek,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
  FaEdit,
  FaSave,
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

const DoctorWeeklySchedule = () => {
  const [doctor, setDoctor] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');
  const [error, setError] = useState('');

  // Editing modal / inline state
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

  const fetchSchedule = async () => {
    try {
      const dashRes = await api.get('/dashboard/doctor');
      if (dashRes.data.success) {
        setDoctor(dashRes.data.data.doctor);
        setSchedules(dashRes.data.data.weeklySchedules || []);
      }
    } catch (err) {
      setError('Failed to fetch doctor schedule.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

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
    if (!doctor || !editingDay) return;

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

      const res = await api.post(`/doctors/${doctor._id}/availability`, payload);
      if (res.data.success) {
        setActionSuccess(`Schedule for ${editingDay} updated successfully.`);
        setEditingDay(null);
        fetchSchedule();
      }
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to update schedule.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>
        Loading weekly schedule...
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>Weekly Working Hours & Availability</h1>
        <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
          Configure working consultation hours, slot duration intervals, and lunch break periods
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

      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Day of Week</th>
                <th>Status</th>
                <th>Working Hours</th>
                <th>Slot Duration</th>
                <th>Lunch / Break Period</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {days.map((dayName) => {
                const dayIndex = dayIndexMap[dayName];
                const sched = schedules.find((s) => s.dayOfWeek === dayIndex);
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
                        <span style={{ fontWeight: '500', color: '#0f766e' }}>
                          {sched.startTime} – {sched.endTime}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>—</span>
                      )}
                    </td>
                    <td>
                      {isAvail ? `${sched.slotDuration} mins` : '—'}
                    </td>
                    <td>
                      {isAvail && sched.breakPeriods?.length > 0 ? (
                        <span style={{ color: '#b45309', fontSize: '0.8125rem' }}>
                          {sched.breakPeriods[0].startTime} – {sched.breakPeriods[0].endTime} ({sched.breakPeriods[0].reason})
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

      {/* Edit Schedule Modal */}
      {editingDay && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              Configure Schedule: <span style={{ color: '#0d9488' }}>{editingDay}</span>
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Define operating consultation hours and patient slot intervals for this weekday
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
                  <span style={{ fontWeight: '600', color: '#0f172a' }}>Available for appointments on this day</span>
                </label>
              </div>

              {editForm.isAvailable && (
                <>
                  <div className="grid-2" style={{ gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Shift Start Time (HH:mm)</label>
                      <input
                        type="time"
                        value={editForm.startTime}
                        onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Shift End Time (HH:mm)</label>
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
                      <option value={30}>30 Minutes (Standard)</option>
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
                  {saving ? 'Saving Schedule...' : 'Save Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorWeeklySchedule;
