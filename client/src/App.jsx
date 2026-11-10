import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Services from './pages/public/Services';
import Doctors from './pages/public/Doctors';
import DoctorDetails from './pages/public/DoctorDetails';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import BookAppointment from './pages/patient/BookAppointment';
import AppointmentConfirmation from './pages/patient/AppointmentConfirmation';
import MyAppointments from './pages/patient/MyAppointments';
import AppointmentHistory from './pages/patient/AppointmentHistory';
import PatientProfile from './pages/patient/PatientProfile';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorTodaySchedule from './pages/doctor/DoctorTodaySchedule';
import DoctorWeeklySchedule from './pages/doctor/DoctorWeeklySchedule';
import DoctorProfilePage from './pages/doctor/DoctorProfilePage';

// Admin & Receptionist Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageDoctors from './pages/admin/ManageDoctors';
import AddDoctor from './pages/admin/AddDoctor';
import EditDoctor from './pages/admin/EditDoctor';
import ManageDepartments from './pages/admin/ManageDepartments';
import ManagePatients from './pages/admin/ManagePatients';
import ManageAppointments from './pages/admin/ManageAppointments';
import ManageWorkingHours from './pages/admin/ManageWorkingHours';
import ManageUsers from './pages/admin/ManageUsers';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Website Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/doctors/:id" element={<DoctorDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Patient Portal Routes */}
          <Route
            path="/patient"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/patient/dashboard" replace />} />
            <Route path="dashboard" element={<PatientDashboard />} />
            <Route path="doctors" element={<Doctors />} />
            <Route path="book/:doctorId" element={<BookAppointment />} />
            <Route path="book" element={<BookAppointment />} />
            <Route path="confirmation/:id" element={<AppointmentConfirmation />} />
            <Route path="appointments" element={<MyAppointments />} />
            <Route path="history" element={<AppointmentHistory />} />
            <Route path="profile" element={<PatientProfile />} />
          </Route>

          {/* Doctor Portal Routes */}
          <Route
            path="/doctor"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/doctor/dashboard" replace />} />
            <Route path="dashboard" element={<DoctorDashboard />} />
            <Route path="today" element={<DoctorTodaySchedule />} />
            <Route path="weekly" element={<DoctorWeeklySchedule />} />
            <Route path="profile" element={<DoctorProfilePage />} />
          </Route>

          {/* Staff & Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin', 'receptionist']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="appointments" element={<ManageAppointments />} />
            <Route path="doctors" element={<ManageDoctors />} />
            <Route path="departments" element={<ManageDepartments />} />
            <Route path="patients" element={<ManagePatients />} />
            <Route path="working-hours" element={<ManageWorkingHours />} />

            {/* Administrator Privileged Routes */}
            <Route
              path="doctors/new"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AddDoctor />
                </ProtectedRoute>
              }
            />
            <Route
              path="doctors/edit/:id"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <EditDoctor />
                </ProtectedRoute>
              }
            />
            <Route
              path="users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManageUsers />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* 404 Fallback */}
          <Route
            path="*"
            element={
              <div style={{ textAlign: 'center', padding: '6rem 1.5rem' }}>
                <h1 style={{ fontSize: '3rem', color: '#0f172a', marginBottom: '1rem' }}>404</h1>
                <p style={{ color: '#64748b', marginBottom: '2rem' }}>Page not found.</p>
                <a href="/" className="btn btn-primary">Return to Homepage</a>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

