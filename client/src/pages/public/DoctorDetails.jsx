import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import {
  FaUserMd,
  FaCalendarCheck,
  FaArrowLeft,
  FaClock,
  FaGraduationCap,
  FaBriefcase,
  FaCheckCircle,
} from 'react-icons/fa';

const DoctorDetails = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await api.get(`/doctors/${id}`);
        if (res.data.success) {
          setDoctor(res.data.doctor);
          setAvailability(res.data.availability || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load physician details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#64748b' }}>Loading doctor details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center', flex: 1 }}>
          <div className="card" style={{ maxWidth: '500px', margin: '0 auto', padding: '3rem 2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#dc2626' }}>Physician Not Found</h2>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{error || 'Unable to load profile.'}</p>
            <Link to="/doctors" className="btn btn-primary">
              <FaArrowLeft />
              <span>Back to Doctors</span>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{
        backgroundColor: '#0f766e',
        color: '#ffffff',
        padding: '3rem 0',
      }}>
        <div className="container">
          <Link to="/doctors" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#ccfbf1',
            fontSize: '0.875rem',
            marginBottom: '1rem',
          }}>
            <FaArrowLeft />
            <span>Back to All Physicians</span>
          </Link>
          <h1 style={{ color: '#ffffff', fontSize: '2.25rem' }}>{doctor.userId?.name}</h1>
          <p style={{ color: '#ccfbf1', fontSize: '1rem' }}>
            {doctor.departmentId?.name} Specialty
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '3.5rem 1.5rem', flex: 1 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3rem',
        }}>
          {/* Left Column: Profile Card */}
          <div>
            <div className="card" style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <img
                  src={doctor.profileImage || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80'}
                  alt={doctor.userId?.name}
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '16px',
                    objectFit: 'cover',
                    border: '1px solid #e2e8f0',
                  }}
                />
                <div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: '#0d9488',
                    textTransform: 'uppercase',
                  }}>
                    {doctor.departmentId?.name}
                  </span>
                  <h2 style={{ fontSize: '1.5rem', color: '#0f172a', margin: '4px 0 8px' }}>
                    {doctor.userId?.name}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    <FaGraduationCap color="#0d9488" />
                    <span>{doctor.qualification}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.875rem' }}>
                    <FaBriefcase color="#0d9488" />
                    <span>{doctor.experience} Years Active Experience</span>
                  </div>
                </div>
              </div>

              <div style={{
                borderTop: '1px solid #f1f5f9',
                paddingTop: '1.25rem',
                marginBottom: '1.5rem',
              }}>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>Biography & Background</h3>
                <p style={{ color: '#475569', lineHeight: '1.7', fontSize: '0.9375rem' }}>
                  {doctor.description}
                </p>
              </div>

              <div style={{
                backgroundColor: '#f0fdfa',
                border: '1px solid #ccfbf1',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <span style={{ fontSize: '0.8125rem', color: '#0f766e', fontWeight: '500' }}>Outpatient Fee</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>
                    ${doctor.consultationFee}
                  </div>
                </div>
                <Link to={`/patient/book/${doctor._id}`} className="btn btn-primary btn-lg">
                  <FaCalendarCheck />
                  <span>Book Appointment</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Weekly Schedule & Availability */}
          <div>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
                <FaClock color="#0d9488" size={20} />
                <h3 style={{ fontSize: '1.25rem' }}>Weekly Consultation Schedule</h3>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>
                Standard working hours and configured slot durations for outpatient clinic visits:
              </p>

              {availability.length === 0 ? (
                <p style={{ color: '#64748b' }}>No working hours currently scheduled.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {availability.map((sched) => (
                    <div key={sched._id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.875rem 1rem',
                      borderRadius: '8px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                    }}>
                      <div style={{ fontWeight: '600', color: '#1e293b' }}>
                        {sched.dayName}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#0f766e', fontWeight: '500' }}>
                        {sched.startTime} – {sched.endTime}
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem', marginLeft: '8px' }}>
                          ({sched.slotDuration} min slots)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{
                marginTop: '1.75rem',
                borderTop: '1px solid #f1f5f9',
                paddingTop: '1.25rem',
                fontSize: '0.8125rem',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <FaCheckCircle color="#0d9488" />
                <span>Daily lunch break observed 13:00 – 14:00 (no bookings generated).</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DoctorDetails;
