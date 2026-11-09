import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

const DashboardLayout = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{
          flex: 1,
          padding: '2rem',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
        }}>
          <Outlet />
        </main>
      </div>
      <style>{`
        @media (max-width: 840px) {
          main {
            padding: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
