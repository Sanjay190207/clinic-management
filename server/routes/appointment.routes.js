const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getMyAppointments,
  getAppointmentById,
  cancelAppointment,
  updateAppointmentStatus,
  getAllAppointments,
} = require('../controllers/appointment.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Specific paths must precede parameterized ':id' routes
router.post('/', protect, authorize('patient', 'receptionist', 'admin'), bookAppointment);
router.get('/my', protect, authorize('patient', 'doctor'), getMyAppointments);
router.get('/', protect, authorize('admin', 'receptionist'), getAllAppointments);

router.get('/:id', protect, getAppointmentById);
router.patch('/:id/cancel', protect, authorize('patient', 'receptionist', 'admin'), cancelAppointment);
router.patch('/:id/status', protect, authorize('doctor', 'receptionist', 'admin'), updateAppointmentStatus);

module.exports = router;

