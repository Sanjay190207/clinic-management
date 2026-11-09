import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  FaCalendarCheck,
  FaClock,
  FaUserMd,
  FaExclamationCircle,
  FaCheckCircle,
  FaArrowLeft,
  FaInfoCircle,
} from 'react-icons/fa';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [allDoctors, setAllDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctorId || '');
  const [doctorDetails, setDoctorDetails] = useState(null);

  // Today's date in YYYY-MM-DD
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [slotsData, setSlotsData] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reasonForVisit, setReasonForVisit] = useState('');

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [conflictError, setConflictError] = useState('');

  // 1. Fetch doctors list for dropdown selector
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get('/doctors');
        if (res.data.success) {
          setAllDoctors(res.data.doctors);
          if (!selectedDoctorId && res.data.doctors.length > 0) {
            setSelectedDoctorId(res.data.doctors[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load doctors list', err);
      }
    };
    fetchDoctors();
  }, []);

  // 2. Fetch selected doctor details
  useEffect(() => {
    if (!selectedDoctorId) return;

    const fetchDoc = async () => {
      try {
        const res = await api.get(`/doctors/${selectedDoctorId}`);
        if (res.data.success) {
          setDoctorDetails(res.data.doctor);
        }
      } catch (err) {
        console.error('Failed to fetch doctor details', err);
      }
    };
    fetchDoc();
  }, [selectedDoctorId]);

  // 3. Fetch available slots whenever doctor or date changes
  const fetchSlots = async () => {
    if (!selectedDoctorId || !selectedDate) return;

    setLoadingSlots(true);
    setError('');
    setConflictError('');
    setSelectedSlot(null);

    try {
      const res = await api.get(`/doctors/${selectedDoctorId}/slots?date=${selectedDate}`);
      if (res.data.success) {
        setSlotsData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load available appointment slots.');
      setSlotsData(null);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [selectedDoctorId, selectedDate]);

  // Handle booking form submission
  const handleBooking = async (e) => {
    e.preventDefault();
    setError('');
    setConflictError('');

    if (!selectedDoctorId || !selectedDate || !selectedSlot) {
      setError('Please select a physician, date, and an available time slot.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/appointments', {
        doctorId: selectedDoctorId,
        appointmentDate: selectedDate,
        startTime: selectedSlot.startTime,
        reasonForVisit: reasonForVisit || 'General Medical Consultation',
      });

      if (res.data.success) {
        navigate(`/patient/confirmation/${res.data.appointment._id}`);
      }
    } catch (err) {
      if (err.response?.status === 409) {
        // Race condition / slot taken!
        setConflictError(
          err.response?.data?.message ||
          'This slot was just booked by another patient. We have refreshed the availability below.'
        );
        fetchSlots(); // Automatically refresh slots for immediate recovery
      } else {
        setError(err.response?.data?.message || 'Failed to book appointment. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link to="/patient/doctors" className="btn btn-secondary btn-sm">
          <FaArrowLeft />
          <span>Back to Doctors</span>
        </Link>
        <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>Book Clinical Appointment</h1>
      </div>

      {conflictError && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FaExclamationCircle size={20} />
          <div>
            <strong>Booking Conflict: </strong>
            <span>{conflictError}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FaExclamationCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem',
        alignItems: 'flex-start',
      }}>
        {/* Left Form: Doctor & Date Selection */}
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaUserMd color="#0d9488" />
            <span>Select Physician & Date</span>
          </h3>

          <div className="form-group">
            <label className="form-label">Consulting Physician</label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="form-select"
            >
              {allDoctors.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  {doc.userId?.name} – {doc.departmentId?.name} (${doc.consultationFee})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Appointment Date</label>
            <input
              type="date"
              min={todayStr}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="form-input"
            />
            <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
              Select today or any upcoming clinic operating date
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Reason for Consultation (Optional)</label>
            <textarea
              rows={3}
              placeholder="e.g. Routine checkup, chronic back pain, skin rash follow-up..."
              value={reasonForVisit}
              onChange={(e) => setReasonForVisit(e.target.value)}
              className="form-textarea"
            />
          </div>

          {doctorDetails && (
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '1rem',
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
            }}>
              <img
                src={doctorDetails.profileImage || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80'}
                alt={doctorDetails.userId?.name}
                style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontWeight: '600', color: '#0f172a' }}>{doctorDetails.userId?.name}</div>
                <div style={{ fontSize: '0.8125rem', color: '#0d9488', fontWeight: '500' }}>
                  {doctorDetails.departmentId?.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Fee: <strong>${doctorDetails.consultationFee}</strong> &bull; {doctorDetails.qualification}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Form: Available Time Slots */}
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaClock color="#0d9488" />
            <span>Available Time Slots</span>
          </h3>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '1.25rem' }}>
            {slotsData ? `${slotsData.dayName || ''} (${selectedDate})` : 'Select a date'}
          </p>

          {loadingSlots ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
              Checking live doctor availability...
            </div>
          ) : !slotsData || slotsData.slots?.length === 0 ? (
            <div style={{
              backgroundColor: '#fef2f2',
              color: '#991b1b',
              padding: '1.5rem',
              borderRadius: '10px',
              textAlign: 'center',
              border: '1px solid #fecaca',
            }}>
              <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>No Slots Available</p>
              <p style={{ fontSize: '0.875rem' }}>
                {slotsData?.message || 'Doctor is not scheduled for outpatient consultations on this day. Please select another date.'}
              </p>
            </div>
          ) : (
            <div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                gap: '0.625rem',
                maxHeight: '260px',
                overflowY: 'auto',
                padding: '4px',
                marginBottom: '1.5rem',
              }}>
                {slotsData.slots.map((slot, index) => {
                  const isSelected = selectedSlot?.startTime === slot.startTime;
                  return (
                    <button
                      key={index}
                      type="button"
                      disabled={!slot.isAvailable}
                      onClick={() => setSelectedSlot(slot)}
                      style={{
                        padding: '0.625rem 0.5rem',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        border: '1px solid',
                        cursor: slot.isAvailable ? 'pointer' : 'not-allowed',
                        transition: 'all 0.15s ease',
                        textAlign: 'center',
                        backgroundColor: isSelected
                          ? '#0d9488'
                          : slot.isAvailable
                          ? '#f0fdfa'
                          : '#f1f5f9',
                        color: isSelected
                          ? '#ffffff'
                          : slot.isAvailable
                          ? '#0f766e'
                          : '#94a3b8',
                        borderColor: isSelected
                          ? '#0d9488'
                          : slot.isAvailable
                          ? '#ccfbf1'
                          : '#e2e8f0',
                      }}
                      title={slot.reason}
                    >
                      <div>{slot.startTime}</div>
                      <div style={{
                        fontSize: '0.65rem',
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        marginTop: '2px',
                        color: isSelected ? '#ccfbf1' : undefined,
                      }}>
                        {isSelected ? 'Selected' : slot.isAvailable ? 'Open' : slot.reason}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Booking Summary Box */}
              {selectedSlot && (
                <div style={{
                  backgroundColor: '#f0fdfa',
                  border: '1px solid #99f6e4',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  marginBottom: '1.25rem',
                }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: '700', color: '#0f766e', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Booking Confirmation Summary
                  </div>
                  <div style={{ fontSize: '0.9375rem', color: '#1e293b', marginBottom: '0.25rem' }}>
                    <strong>Date:</strong> {selectedDate} ({slotsData.dayName})
                  </div>
                  <div style={{ fontSize: '0.9375rem', color: '#1e293b', marginBottom: '0.25rem' }}>
                    <strong>Time:</strong> {selectedSlot.startTime} – {selectedSlot.endTime} (30 mins)
                  </div>
                  <div style={{ fontSize: '0.9375rem', color: '#1e293b' }}>
                    <strong>Consultation Fee:</strong> ${doctorDetails?.consultationFee || 100}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleBooking}
                disabled={!selectedSlot || submitting}
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
              >
                {submitting ? 'Confirming with Doctor Schedule...' : 'Confirm Appointment'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
