import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import {
  FaSearch,
  FaUserMd,
  FaFilter,
  FaCalendarCheck,
  FaInfoCircle,
} from 'react-icons/fa';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedDepartment = searchParams.get('department') || '';
  const searchTerm = searchParams.get('search') || '';

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const deptRes = await api.get('/departments');
        if (deptRes.data.success) {
          setDepartments(deptRes.data.departments);
        }
      } catch (err) {
        console.error('Failed to load departments', err);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedDepartment) params.append('department', selectedDepartment);
        if (searchTerm) params.append('search', searchTerm);

        const res = await api.get(`/doctors?${params.toString()}`);
        if (res.data.success) {
          setDoctors(res.data.doctors);
        }
      } catch (err) {
        console.error('Failed to load doctors', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [selectedDepartment, searchTerm]);

  const handleDepartmentChange = (deptId) => {
    const next = new URLSearchParams(searchParams);
    if (deptId) {
      next.set('department', deptId);
    } else {
      next.delete('department');
    }
    setSearchParams(next);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    const next = new URLSearchParams(searchParams);
    if (val) {
      next.set('search', val);
    } else {
      next.delete('search');
    }
    setSearchParams(next);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{
        backgroundColor: '#0f766e',
        color: '#ffffff',
        padding: '3.5rem 0',
      }}>
        <div className="container">
          <h1 style={{ color: '#ffffff', fontSize: '2.5rem', marginBottom: '0.5rem' }}>Browse Clinic Physicians</h1>
          <p style={{ color: '#ccfbf1', fontSize: '1.125rem' }}>
            Choose a doctor by specialty, view their profile, and book your verified appointment slot.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '3rem 1.5rem', flex: 1 }}>
        {/* Search & Filter Bar */}
        <div className="card" style={{ marginBottom: '2.5rem', padding: '1.25rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
            alignItems: 'center',
          }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search physician by name, degree..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
              />
              <FaSearch
                style={{
                  position: 'absolute',
                  left: '0.875rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                }}
              />
            </div>

            {/* Department Filter */}
            <div style={{ position: 'relative' }}>
              <select
                value={selectedDepartment}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                className="form-select"
                style={{ paddingLeft: '2.5rem' }}
              >
                <option value="">All Clinical Departments</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <FaFilter
                style={{
                  position: 'absolute',
                  left: '0.875rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                }}
              />
            </div>

            {/* Clear Filters */}
            {(selectedDepartment || searchTerm) && (
              <div>
                <button
                  onClick={() => setSearchParams({})}
                  className="btn btn-secondary btn-sm"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div style={{ marginBottom: '1.5rem', color: '#64748b', fontSize: '0.875rem' }}>
          Showing <strong>{doctors.length}</strong> available physician{doctors.length === 1 ? '' : 's'}
        </div>

        {/* Doctors Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ color: '#64748b' }}>Loading doctor directory...</p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <FaUserMd size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Physicians Found</h3>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
              We could not find any active physicians matching your filter criteria.
            </p>
            <button onClick={() => setSearchParams({})} className="btn btn-primary">
              View All Physicians
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
          }}>
            {doctors.map((doc) => (
              <div key={doc._id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                  <img
                    src={doc.profileImage || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80'}
                    alt={doc.userId?.name}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '12px',
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
                      {doc.departmentId?.name}
                    </span>
                    <h3 style={{ fontSize: '1.125rem', marginTop: '2px', color: '#0f172a' }}>
                      {doc.userId?.name}
                    </h3>
                    <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                      {doc.qualification}
                    </p>
                    <p style={{ fontSize: '0.8125rem', color: '#475569', fontWeight: '500' }}>
                      {doc.experience} Years Experience
                    </p>
                  </div>
                </div>

                <p style={{
                  fontSize: '0.875rem',
                  color: '#475569',
                  lineHeight: '1.6',
                  marginBottom: '1.5rem',
                  flex: 1,
                }}>
                  {doc.description}
                </p>

                <div style={{
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Consultation</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>
                      ${doc.consultationFee}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link to={`/doctors/${doc._id}`} className="btn btn-secondary btn-sm" title="View details & weekly availability">
                      Profile
                    </Link>
                    <Link to={`/patient/book/${doc._id}`} className="btn btn-primary btn-sm">
                      <FaCalendarCheck />
                      <span>Book Slot</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Doctors;

