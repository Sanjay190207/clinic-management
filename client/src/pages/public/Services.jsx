import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import {
  FaHeartbeat,
  FaStethoscope,
  FaBaby,
  FaBone,
  FaBrain,
  FaAllergies,
  FaCalendarCheck,
  FaCheck,
} from 'react-icons/fa';

const deptIcons = {
  Cardiology: <FaHeartbeat size={28} color="#0d9488" />,
  'General Medicine': <FaStethoscope size={28} color="#0d9488" />,
  Pediatrics: <FaBaby size={28} color="#0d9488" />,
  Dermatology: <FaAllergies size={28} color="#0d9488" />,
  Orthopedics: <FaBone size={28} color="#0d9488" />,
  Neurology: <FaBrain size={28} color="#0d9488" />,
};

const Services = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get('/departments');
        if (res.data.success) {
          setDepartments(res.data.departments);
        }
      } catch (err) {
        console.error('Failed to load services', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{
        backgroundColor: '#0f766e',
        color: '#ffffff',
        padding: '3.5rem 0',
      }}>
        <div className="container">
          <h1 style={{ color: '#ffffff', fontSize: '2.5rem', marginBottom: '0.5rem' }}>Clinical Services & Specialties</h1>
          <p style={{ color: '#ccfbf1', fontSize: '1.125rem' }}>
            Comprehensive outpatient healthcare services delivered by experienced specialists.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '4rem 1.5rem', flex: 1 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
        }}>
          {departments.map((dept) => (
            <div key={dept._id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                backgroundColor: '#f0fdfa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}>
                {deptIcons[dept.name] || <FaStethoscope size={28} color="#0d9488" />}
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{dept.name}</h3>
              <p style={{ fontSize: '0.9375rem', color: '#475569', lineHeight: '1.6', marginBottom: '1.5rem', flex: 1 }}>
                {dept.description}
              </p>
              <div style={{
                borderTop: '1px solid #f1f5f9',
                paddingTop: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                  {dept.doctorCount || 1} Attending Physician{dept.doctorCount === 1 ? '' : 's'}
                </span>
                <Link to={`/doctors?department=${dept._id}`} className="btn btn-outline btn-sm">
                  View Doctors
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* General Care Notice */}
        <div style={{
          marginTop: '3.5rem',
          backgroundColor: '#f0fdfa',
          border: '1px solid #ccfbf1',
          borderRadius: '16px',
          padding: '2.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '2rem',
        }}>
          <div style={{ maxWidth: '600px' }}>
            <h3 style={{ fontSize: '1.5rem', color: '#0f766e', marginBottom: '0.5rem' }}>
              Need Help Deciding Which Specialist to See?
            </h3>
            <p style={{ color: '#475569', fontSize: '0.9375rem', lineHeight: '1.6' }}>
              If you are experiencing non-specific symptoms or require a preliminary evaluation, our General Medicine team provides thorough primary health examinations and will refer you to the correct internal specialist.
            </p>
          </div>
          <Link to="/doctors" className="btn btn-primary btn-lg">
            <FaCalendarCheck />
            <span>Book Consultation</span>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Services;

