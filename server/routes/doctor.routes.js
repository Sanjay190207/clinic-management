const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  toggleDoctorStatus,
  deleteDoctor,
} = require('../controllers/doctor.controller');
const {
  getDoctorAvailability,
  getAvailableSlots,
  setDoctorAvailability,
  updateDoctorAvailability,
} = require('../controllers/availability.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public endpoints
router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/availability', getDoctorAvailability);
router.get('/:id/slots', getAvailableSlots);

// Admin-only endpoints
router.post('/', protect, authorize('admin'), createDoctor);
router.patch('/:id/status', protect, authorize('admin'), toggleDoctorStatus);
router.delete('/:id', protect, authorize('admin'), deleteDoctor);

// Admin or Doctor endpoints
router.put('/:id', protect, authorize('admin', 'doctor'), updateDoctor);
router.post('/:id/availability', protect, authorize('admin', 'doctor'), setDoctorAvailability);
router.put('/:id/availability/:availabilityId', protect, authorize('admin', 'doctor'), updateDoctorAvailability);

module.exports = router;

