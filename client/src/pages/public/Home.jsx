import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import {
  FaUserMd,
  FaCalendarCheck,
  FaHospital,
  FaClock,
  FaShieldAlt,
  FaCheckCircle,
  FaArrowRight,
  FaStethoscope,
  FaHeartbeat,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
} from 'react-icons/fa';

const Home = () => {
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docRes, deptRes] = await Promise.all([
          api.get('/doctors'),
          api.get('/departments'),
        ]);
        if (docRes.data.success) {
          setFeaturedDoctors(docRes.data.doctors.slice(0, 4));
        }
        if (deptRes.data.success) {
          setDepartments(deptRes.data.departments.slice(0, 6));
        }
      } catch (err) {
        console.error('Failed to load landing page data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%)',
        padding: '5rem 0',
        borderBottom: '1px solid #ccfbf1',
      }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          alignItems: 'center',
          gap: '3rem',
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#ccfbf1',
              color: '#0f766e',
              padding: '0.375rem 0.875rem',
              borderRadius: '9999px',
              fontSize: '0.8125rem',
              fontWeight: '600',
              marginBottom: '1.25rem',
            }}>
              <FaShieldAlt />
              <span>Certified Healthcare & Outpatient Clinic</span>
            </div>
            <h1 style={{
              fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
              fontWeight: '800',
              lineHeight: 1.15,
              color: '#0f172a',
              marginBottom: '1.25rem',
            }}>
              Personalized Healthcare, <br />
              <span style={{ color: '#0d9488' }}>Seamless Appointments</span>
            </h1>
            <p style={{
              fontSize: '1.125rem',
              lineHeight: 1.7,
              color: '#475569',
              marginBottom: '2rem',
              maxWidth: '540px',
            }}>
              CarePulse connects you directly to leading specialists. Browse verified physician schedules, book instant consultation slots, and manage clinic visits with confidence.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <Link to="/doctors" className="btn btn-primary btn-lg">
                <FaCalendarCheck />
                <span>Book Appointment</span>
              </Link>
              <Link to="/services" className="btn btn-secondary btn-lg">
                <span>View Clinical Services</span>
              </Link>
            </div>

            {/* Quick Metrics */}
            <div style={{
              display: 'flex',
              gap: '2.5rem',
              marginTop: '3rem',
              borderTop: '1px solid #cbd5e1',
              paddingTop: '1.5rem',
            }}>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f766e' }}>6+</div>
                <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Specialist Depts</div>
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f766e' }}>100%</div>
                <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Verified Doctors</div>
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f766e' }}>Zero Wait</div>
                <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Direct Slot Booking</div>
              </div>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div style={{ position: 'relative' }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 20px 40px rgba(15, 118, 110, 0.1)',
              border: '1px solid #e2e8f0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  backgroundColor: '#f0fdfa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0d9488',
                }}>
                  <FaStethoscope size={28} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '700' }}>Immediate Consultation</h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Real-time doctor calendar sync</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.9375rem', color: '#334155' }}>
                  <FaCheckCircle color="#0d9488" />
                  <span>Real-time slot availability check</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.9375rem', color: '#334155' }}>
                  <FaCheckCircle color="#0d9488" />
                  <span>Automated unique appointment reference</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.9375rem', color: '#334155' }}>
                  <FaCheckCircle color="#0d9488" />
                  <span>Transparent consultation fees</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.9375rem', color: '#334155' }}>
                  <FaCheckCircle color="#0d9488" />
                  <span>Hassle-free cancellation before cutoff</span>
                </div>
              </div>

              <div style={{
                backgroundColor: '#f8fafc',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaClock color="#0d9488" />
                  <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>Next Available Slot Today</span>
                </div>
                <Link to="/doctors" style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#0d9488' }}>
                  Check Times &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: '5rem 0', backgroundColor: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem', color: '#0f172a' }}>How It Works</h2>
            <p style={{ color: '#64748b', fontSize: '1rem' }}>
              Booking an appointment at CarePulse is fast, transparent, and completely digitized.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2rem',
          }}>
            {[
              {
                step: '01',
                title: 'Select Department',
                desc: 'Filter our medical departments ranging from Cardiology to Pediatrics and Dermatology.',
                icon: <FaHospital size={24} color="#0d9488" />,
              },
              {
                step: '02',
                title: 'Choose Physician',
                desc: 'Review doctor profiles, clinical experience, qualifications, and consultation pricing.',
                icon: <FaUserMd size={24} color="#0d9488" />,
              },
              {
                step: '03',
                title: 'Pick Time Slot',
                desc: 'Select your preferred appointment date and choose from live open consultation slots.',
                icon: <FaClock size={24} color="#0d9488" />,
              },
              {
                step: '04',
                title: 'Confirmed Instantly',
                desc: 'Receive your unique booking reference number and manage your visits anytime online.',
                icon: <FaCalendarCheck size={24} color="#0d9488" />,
              },
            ].map((item, idx) => (
              <div key={idx} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: '900',
                  color: '#f0fdfa',
                  position: 'absolute',
                  top: '0.5rem',
                  right: '1rem',
                }}>
                  {item.step}
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '10px',
                  backgroundColor: '#f0fdfa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: '1.6' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section style={{ padding: '5rem 0', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: '3rem',
            gap: '1rem',
          }}>
            <div>
              <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Featured Medical Specialists</h2>
              <p style={{ color: '#64748b' }}>Meet our dedicated healthcare team available for outpatient consultation.</p>
            </div>
            <Link to="/doctors" className="btn btn-outline">
              <span>View All Doctors</span>
              <FaArrowRight size={12} />
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
            gap: '1.75rem',
          }}>
            {featuredDoctors.map((doc) => (
              <div key={doc._id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{
                  height: '190px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  marginBottom: '1.25rem',
                  backgroundColor: '#e2e8f0',
                }}>
                  <img
                    src={doc.profileImage || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80'}
                    alt={doc.userId?.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: '#0d9488',
                  textTransform: 'uppercase',
                  marginBottom: '0.25rem',
                }}>
                  {doc.departmentId?.name}
                </div>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>{doc.userId?.name}</h3>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '0.75rem' }}>
                  {doc.qualification} &bull; {doc.experience} yrs exp
                </p>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#475569',
                  lineHeight: '1.5',
                  marginBottom: '1.25rem',
                  flex: 1,
                }}>
                  {doc.description.slice(0, 110)}...
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '1rem',
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Fee</span>
                    <span style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0f172a' }}>
                      ${doc.consultationFee}
                    </span>
                  </div>
                  <Link to={`/patient/book/${doc._id}`} className="btn btn-primary btn-sm">
                    Book Slot
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About & Services Section */}
      <section style={{ padding: '5rem 0', backgroundColor: '#ffffff' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3.5rem',
            alignItems: 'center',
          }}>
            <div>
              <div style={{
                color: '#0d9488',
                fontWeight: '700',
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}>
                About CarePulse Clinic
              </div>
              <h2 style={{ fontSize: '2.25rem', marginBottom: '1.25rem', color: '#0f172a' }}>
                Committed to Exceptional Patient Outcomes & Clinical Care
              </h2>
              <p style={{ fontSize: '1rem', color: '#475569', lineHeight: '1.7', marginBottom: '1.25rem' }}>
                Established as a community-first clinic, CarePulse integrates cutting-edge digital scheduling with personalized medical care. Our team of board-certified doctors, registered nurses, and dedicated receptionists work together to deliver comprehensive consultations.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <FaCheckCircle color="#0d9488" />
                  <span style={{ color: '#334155' }}>Evidence-based outpatient treatment plans</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <FaCheckCircle color="#0d9488" />
                  <span style={{ color: '#334155' }}>Strict patient privacy & encrypted medical records</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <FaCheckCircle color="#0d9488" />
                  <span style={{ color: '#334155' }}>Modern facility equipped with on-site diagnostic partnerships</span>
                </div>
              </div>
              <Link to="/about" className="btn btn-primary">
                <span>Learn More About Us</span>
                <FaArrowRight size={12} />
              </Link>
            </div>

            {/* Department Cards Grid */}
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: '#0f172a' }}>Our Specialties</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
              }}>
                {departments.map((dept) => (
                  <div key={dept._id} style={{
                    backgroundColor: '#f8fafc',
                    padding: '1.25rem',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                  }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: '#f0fdfa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0d9488',
                      marginBottom: '0.75rem',
                    }}>
                      <FaHeartbeat size={18} />
                    </div>
                    <h4 style={{ fontSize: '1rem', marginBottom: '0.375rem' }}>{dept.name}</h4>
                    <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                      {dept.doctorCount} Specialist{dept.doctorCount === 1 ? '' : 's'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section style={{
        padding: '4rem 0',
        backgroundColor: '#f0fdfa',
        borderTop: '1px solid #ccfbf1',
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            alignItems: 'center',
          }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem', color: '#0f766e' }}>Visit Our Clinic</h2>
              <p style={{ color: '#475569', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
                We are conveniently located in the central healthcare district with ample parking and accessibility.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FaMapMarkerAlt color="#0d9488" />
                  <span>452 Wellness Blvd, Health District, Suite 100</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FaPhoneAlt color="#0d9488" />
                  <span>+1 (800) 555-CARE / +1-555-0100</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FaEnvelope color="#0d9488" />
                  <span>reception@carepulse.com</span>
                </div>
              </div>
            </div>

            <div className="card" style={{ border: '1px solid #ccfbf1' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Need Assistance Booking?</h3>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem' }}>
                Our front desk reception is available Monday through Friday from 08:00 AM to 06:00 PM to help you with scheduling or special accommodations.
              </p>
              <Link to="/register" className="btn btn-primary" style={{ width: '100%' }}>
                Create Free Patient Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
