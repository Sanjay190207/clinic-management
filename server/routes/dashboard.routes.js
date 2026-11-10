const express = require('express');
const router = express.Router();
const {
  getPatientDashboard,
  getDoctorDashboard,
  getAdminDashboard,
} = require('../controllers/dashboard.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/patient', protect, authorize('patient'), getPatientDashboard);
router.get('/doctor', protect, authorize('doctor'), getDoctorDashboard);
router.get('/admin', protect, authorize('admin', 'receptionist'), getAdminDashboard);

module.exports = router;

