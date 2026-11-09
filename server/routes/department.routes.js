const express = require('express');
const router = express.Router();
const {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/department.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public endpoints
router.get('/', getDepartments);
router.get('/:id', getDepartmentById);

// Admin-only endpoints
router.post('/', protect, authorize('admin'), createDepartment);
router.put('/:id', protect, authorize('admin'), updateDepartment);
router.delete('/:id', protect, authorize('admin'), deleteDepartment);

module.exports = router;
