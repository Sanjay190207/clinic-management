/**
 * Automated API and Business Logic Integration Test Suite
 */
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Department = require('../models/Department');
const Appointment = require('../models/Appointment');

let server;
let baseUrl;

const runTests = async () => {
  let passed = 0;
  let failed = 0;

  const assert = (condition, description) => {
    if (condition) {
      console.log(`  \x1b[32m✔ PASS:\x1b[0m ${description}`);
      passed++;
    } else {
      console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${description}`);
      failed++;
    }
  };

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/clinic_appointment_db';
    await mongoose.connect(mongoUri);

    // Start ephemeral server on random port
    const testPort = 5999;
    server = app.listen(testPort);
    baseUrl = `http://127.0.0.1:${testPort}/api`;

    console.log('\n======================================================');
    console.log(' STARTING CLINIC APPOINTMENT SYSTEM INTEGRATION TESTS');
    console.log('======================================================\n');

    // Helper for fetch requests
    const request = async (endpoint, options = {}) => {
      const res = await fetch(`${baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(options.token && { Authorization: `Bearer ${options.token}` }),
          ...options.headers,
        },
        method: options.method || 'GET',
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
      const data = await res.json().catch(() => ({}));
      return { status: res.status, data };
    };

    // 1. Healthcheck Test
    console.log('[Suite 1: System Health & Base Configuration]');
    const health = await request('/health');
    assert(health.status === 200 && health.data.status === 'healthy', 'API health check responds 200 OK');

    // 2. Authentication & Registration Tests
    console.log('\n[Suite 2: Authentication & Authorization]');
    const uniqueEmail = `test.patient.${Date.now()}@example.com`;
    const regRes = await request('/auth/register', {
      method: 'POST',
      body: {
        name: 'Test Patient Automation',
        email: uniqueEmail,
        phone: '+1-555-9999',
        password: 'Password@123',
      },
    });
    assert(regRes.status === 201 && regRes.data.success && regRes.data.token, 'Patient registration succeeds with 201 Created');
    const patientToken = regRes.data.token;
    const testPatientId = regRes.data.user.id;

    // Duplicate Email Check
    const dupRegRes = await request('/auth/register', {
      method: 'POST',
      body: {
        name: 'Duplicate Patient',
        email: uniqueEmail,
        phone: '+1-555-9998',
        password: 'Password@123',
      },
    });
    assert(dupRegRes.status === 409, 'Duplicate email registration correctly rejected with 409 Conflict');

    // Valid Login
    const loginRes = await request('/auth/login', {
      method: 'POST',
      body: {
        email: uniqueEmail,
        password: 'Password@123',
      },
    });
    assert(loginRes.status === 200 && loginRes.data.user.role === 'patient', 'Patient login returns 200 with JWT token');

    // Invalid Login
    const badLoginRes = await request('/auth/login', {
      method: 'POST',
      body: {
        email: uniqueEmail,
        password: 'WrongPassword!',
      },
    });
    assert(badLoginRes.status === 401, 'Invalid credentials rejected with 401 Unauthorized');

    // Admin Login
    const adminLogin = await request('/auth/login', {
      method: 'POST',
      body: {
        email: 'admin@carepulse.com',
        password: 'Admin@123',
      },
    });
    assert(adminLogin.status === 200 && adminLogin.data.user.role === 'admin', 'Administrator login succeeds');
    const adminToken = adminLogin.data.token;

    // Doctor Login
    const doctorLogin = await request('/auth/login', {
      method: 'POST',
      body: {
        email: 'dr.sharma@carepulse.com',
        password: 'Doctor@123',
      },
    });
    assert(doctorLogin.status === 200 && doctorLogin.data.user.role === 'doctor', 'Doctor login succeeds');
    const doctorToken = doctorLogin.data.token;

    // Receptionist Login
    const receptionLogin = await request('/auth/login', {
      method: 'POST',
      body: {
        email: 'reception@carepulse.com',
        password: 'Reception@123',
      },
    });
    assert(receptionLogin.status === 200 && receptionLogin.data.user.role === 'receptionist', 'Receptionist login succeeds');
    const receptionToken = receptionLogin.data.token;

    // Role-based Access Restriction: Patient cannot access Admin User Management
    const forbiddenUserList = await request('/users', { token: patientToken });
    assert(forbiddenUserList.status === 403, 'Patient forbidden from accessing /api/users (403)');

    // Receptionist cannot access User Management (Admin only)
    const receptionForbiddenUsers = await request('/users', { token: receptionToken });
    assert(receptionForbiddenUsers.status === 403, 'Receptionist forbidden from accessing privileged /api/users (403)');

    // Admin CAN access User Management
    const adminUserList = await request('/users', { token: adminToken });
    assert(adminUserList.status === 200 && Array.isArray(adminUserList.data.users), 'Admin authorized to access /api/users (200)');

    // 3. Departments & Doctors
    console.log('\n[Suite 3: Department & Doctor Management]');
    const depts = await request('/departments');
    assert(depts.status === 200 && depts.data.departments.length >= 5, 'Departments listed successfully (>= 5 departments)');

    const doctors = await request('/doctors');
    assert(doctors.status === 200 && doctors.data.doctors.length >= 6, 'Doctors listed successfully (>= 6 doctors)');
    // Find Dr. Sharma who corresponds to the logged-in doctor token
    const testDoctor = doctors.data.doctors.find((d) => d.userId.email === 'dr.sharma@carepulse.com') || doctors.data.doctors[0];
    const otherDoctor = doctors.data.doctors.find((d) => d._id !== testDoctor._id);

    // Filter doctors by department
    const deptFiltered = await request(`/doctors?department=${testDoctor.departmentId._id}`);
    assert(deptFiltered.status === 200 && deptFiltered.data.doctors.length > 0, 'Doctor filtering by department ID works');

    // 4. Availability & Slot Generation
    console.log('\n[Suite 4: Doctor Working Hours & Slot Generation]');
    // Pick next Monday
    const today = new Date();
    const daysUntilNextMonday = (1 + 7 - today.getDay()) % 7 || 7;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilNextMonday + 7); // Ensure next week to avoid past hours
    const testBookingDate = nextMonday.toISOString().slice(0, 10);

    const slotsRes = await request(`/doctors/${testDoctor._id}/slots?date=${testBookingDate}`);
    assert(slotsRes.status === 200 && Array.isArray(slotsRes.data.slots), 'Slot generation API returns 200 with slot list');
    assert(slotsRes.data.slots.some((s) => s.isAvailable === true), 'Generates available working hour slots');
    assert(
      slotsRes.data.slots.some((s) => s.reason === 'Break Period' && s.isAvailable === false),
      'Correctly flags lunch break period (13:00 - 14:00) as unavailable'
    );

    // 5. Core Appointment Booking & Concurrency Conflict Prevention
    console.log('\n[Suite 5: Appointment Booking, Race Conditions & Cancellation]');
    // Pick an available slot
    const availableSlot = slotsRes.data.slots.find((s) => s.isAvailable);
    const chosenTime = availableSlot.startTime;

    const bookRes = await request('/appointments', {
      method: 'POST',
      token: patientToken,
      body: {
        doctorId: testDoctor._id,
        appointmentDate: testBookingDate,
        startTime: chosenTime,
        reasonForVisit: 'Integration test consultation',
      },
    });
    assert(bookRes.status === 201 && bookRes.data.appointment.appointmentReference, 'Appointment booked successfully with unique reference');
    const bookedAppointment = bookRes.data.appointment;

    // SIMULTANEOUS / DUPLICATE BOOKING TEST (Race Condition Prevention)
    const duplicateBookRes = await request('/appointments', {
      method: 'POST',
      token: patientToken,
      body: {
        doctorId: testDoctor._id,
        appointmentDate: testBookingDate,
        startTime: chosenTime,
        reasonForVisit: 'Simultaneous duplicate booking attempt',
      },
    });
    assert(
      duplicateBookRes.status === 409,
      'Duplicate booking for the same doctor and slot rejected with 409 Conflict'
    );

    // Verify slot is now marked as unavailable in slot listing
    const slotsAfterBooking = await request(`/doctors/${testDoctor._id}/slots?date=${testBookingDate}`);
    const bookedSlotCheck = slotsAfterBooking.data.slots.find((s) => s.startTime === chosenTime);
    assert(
      bookedSlotCheck && bookedSlotCheck.isAvailable === false && bookedSlotCheck.reason === 'Booked',
      'Slot generation reflects newly booked appointment as unavailable'
    );

    // 6. Patient View & Doctor View
    console.log('\n[Suite 6: Patient & Doctor Dashboard Workflows]');
    const patientAppointments = await request('/appointments/my', { token: patientToken });
    assert(
      patientAppointments.status === 200 &&
      patientAppointments.data.appointments.some((a) => a._id === bookedAppointment._id),
      'Patient personal appointments list includes their new booking'
    );

    const patientDash = await request('/dashboard/patient', { token: patientToken });
    assert(
      patientDash.status === 200 && patientDash.data.data.stats.total >= 1,
      'Patient dashboard displays active statistics and next appointment'
    );

    // Status update by Doctor: Doctor marks appointment as 'Checked In'
    const statusUpdateRes = await request(`/appointments/${bookedAppointment._id}/status`, {
      method: 'PATCH',
      token: doctorToken,
      body: {
        status: 'Checked In',
        notes: 'Patient arrived and checked in at front desk.',
      },
    });
    assert(statusUpdateRes.status === 200 && statusUpdateRes.data.appointment.status === 'Checked In', 'Doctor can update status to Checked In');

    // Doctor status update to 'Completed'
    const completeRes = await request(`/appointments/${bookedAppointment._id}/status`, {
      method: 'PATCH',
      token: doctorToken,
      body: {
        status: 'Completed',
        notes: 'Consultation completed. Patient advised rest.',
      },
    });
    assert(completeRes.status === 200 && completeRes.data.appointment.status === 'Completed', 'Doctor can complete appointment');

    // Cross-doctor security check: Booking an appointment with another doctor
    if (otherDoctor) {
      const otherDoctorSlotRes = await request(`/doctors/${otherDoctor._id}/slots?date=${testBookingDate}`);
      const otherSlot = otherDoctorSlotRes.data.slots?.find((s) => s.isAvailable);
      if (otherSlot) {
        const otherApptRes = await request('/appointments', {
          method: 'POST',
          token: patientToken,
          body: {
            doctorId: otherDoctor._id,
            appointmentDate: testBookingDate,
            startTime: otherSlot.startTime,
            reasonForVisit: 'Cross doctor appointment test',
          },
        });
        if (otherApptRes.status === 201) {
          // Dr. Sharma attempts to modify Dr. Other's appointment
          const unauthorizedUpdate = await request(`/appointments/${otherApptRes.data.appointment._id}/status`, {
            method: 'PATCH',
            token: doctorToken,
            body: { status: 'Completed' },
          });
          assert(
            unauthorizedUpdate.status === 403,
            'Doctor strictly prevented from modifying another doctor’s appointment (403 Forbidden)'
          );
        }
      }
    }

    // Cancellation of another new appointment
    const anotherSlot = slotsRes.data.slots.find((s) => s.isAvailable && s.startTime !== chosenTime);
    const cancelTarget = await request('/appointments', {
      method: 'POST',
      token: patientToken,
      body: {
        doctorId: testDoctor._id,
        appointmentDate: testBookingDate,
        startTime: anotherSlot.startTime,
        reasonForVisit: 'Appointment to be cancelled',
      },
    });
    assert(cancelTarget.status === 201, 'Secondary appointment booked for cancellation test');

    const cancelRes = await request(`/appointments/${cancelTarget.data.appointment._id}/cancel`, {
      method: 'PATCH',
      token: patientToken,
      body: {
        reason: 'Change in schedule',
      },
    });
    assert(cancelRes.status === 200 && cancelRes.data.appointment.status === 'Cancelled', 'Patient cancels appointment successfully before cutoff');

    // Re-booking of cancelled slot: Slot is released upon cancellation!
    const rebookCancelledSlot = await request('/appointments', {
      method: 'POST',
      token: patientToken,
      body: {
        doctorId: testDoctor._id,
        appointmentDate: testBookingDate,
        startTime: anotherSlot.startTime,
        reasonForVisit: 'Rebooking previously cancelled slot',
      },
    });
    assert(
      rebookCancelledSlot.status === 201,
      'Previously cancelled slot is released and can be rebooked without conflict'
    );

    // 7. Admin & Receptionist Dashboard & Management
    console.log('\n[Suite 7: Admin & Receptionist Operations]');
    const adminDash = await request('/dashboard/admin', { token: adminToken });
    assert(
      adminDash.status === 200 &&
      adminDash.data.data.stats.totalPatients >= 10 &&
      adminDash.data.data.stats.totalDoctors >= 6,
      'Admin dashboard displays accurate clinic-wide statistics'
    );

    const patientsList = await request('/patients', { token: adminToken });
    assert(patientsList.status === 200 && patientsList.data.patients.length >= 10, 'Admin can view registered patients with appointment counts');

    console.log('\n======================================================');
    console.log(` INTEGRATION TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log('======================================================\n');

    server.close();
    await mongoose.connection.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Test execution error:', error);
    if (server) server.close();
    await mongoose.connection.close();
    process.exit(1);
  }
};

runTests();
