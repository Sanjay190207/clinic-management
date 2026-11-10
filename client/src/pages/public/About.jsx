import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import {
  FaHeartbeat,
  FaAward,
  FaUserNurse,
  FaHandHoldingMedical,
  FaCheckCircle,
} from 'react-icons/fa';

const About = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Banner */}
      <div style={{
        backgroundColor: '#0f766e',
        color: '#ffffff',
        padding: '3.5rem 0',
      }}>
        <div className="container">
          <h1 style={{ color: '#ffffff', fontSize: '2.5rem', marginBottom: '0.5rem' }}>About CarePulse Clinic</h1>
          <p style={{ color: '#ccfbf1', fontSize: '1.125rem' }}>
            Delivering modern, compassionate outpatient care and digitized healthcare scheduling since 2018.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '4rem 1.5rem', flex: 1 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3rem',
          alignItems: 'center',
          marginBottom: '4rem',
        }}>
          <div>
            <span style={{ color: '#0d9488', fontWeight: '700', fontSize: '0.875rem', textTransform: 'uppercase' }}>
              Our Founding Mission
            </span>
            <h2 style={{ fontSize: '2rem', margin: '0.5rem 0 1.25rem', color: '#0f172a' }}>
              Bridging Clinical Excellence with Modern Patient Convenience
            </h2>
            <p style={{ color: '#475569', lineHeight: '1.7', marginBottom: '1rem' }}>
              CarePulse was founded to eliminate long waiting times, uncertain scheduling, and fragmented communication between doctors and patients. We believe that booking an appointment should be as simple and predictable as any digital service, while providing the highest standard of personalized medical care.
            </p>
            <p style={{ color: '#475569', lineHeight: '1.7', marginBottom: '1.5rem' }}>
              Our outpatient center unites general practitioners and board-certified specialists in Cardiology, Pediatrics, Dermatology, Orthopedics, and Neurology under one roof.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/doctors" className="btn btn-primary">Find a Doctor</Link>
              <Link to="/services" className="btn btn-secondary">Explore Services</Link>
            </div>
          </div>

          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '2.5rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
          }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Core Clinical Values</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ color: '#0d9488', marginTop: '3px' }}><FaCheckCircle size={20} /></div>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Patient-First Philosophy</h4>
                  <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    Dedicated 30-minute consultation slots ensuring in-depth evaluation and unhurried doctor attention.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ color: '#0d9488', marginTop: '3px' }}><FaCheckCircle size={20} /></div>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Integrity & Transparency</h4>
                  <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    Upfront consultation fees with zero hidden hospital charges and transparent cancellation policies.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ color: '#0d9488', marginTop: '3px' }}><FaCheckCircle size={20} /></div>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Strict Health Data Privacy</h4>
                  <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    Full role-based authorization ensuring only authorized healthcare staff access patient medical records.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pillars */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
        }}>
          <div className="card">
            <FaAward size={32} color="#0d9488" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Board-Certified Staff</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: '1.6' }}>
              All physicians possess advanced degrees, active state licenses, and a minimum of 8 years of clinical experience.
            </p>
          </div>
          <div className="card">
            <FaUserNurse size={32} color="#0d9488" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Full Support Team</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: '1.6' }}>
              Our friendly reception and nursing staff are on-site daily to manage check-ins, record vitals, and assist patients.
            </p>
          </div>
          <div className="card">
            <FaHandHoldingMedical size={32} color="#0d9488" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Preventative Care Focus</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: '1.6' }}>
              We emphasize routine screenings, annual wellness panels, and lifestyle coaching to prevent chronic illness.
            </p>
          </div>
          <div className="card">
            <FaHeartbeat size={32} color="#0d9488" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Rapid Booking</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: '1.6' }}>
              Direct calendar integration lets patients lock in a time slot without phone waiting queues or delayed callbacks.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;

