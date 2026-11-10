const express = require('express');
const router = express.Router();
const {
  getPatients,
  getPatientById,
  updatePatientProfile,
} = require('../controllers/patient.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.put('/profile', protect, authorize('patient'), updatePatientProfile);
router.get('/', protect, authorize('admin', 'receptionist'), getPatients);
router.get('/:id', protect, getPatientById);

module.exports = router;

