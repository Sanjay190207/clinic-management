const express = require('express');
const router = express.Router();
const {
  getUsers,
  createUser,
  toggleUserStatus,
} = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// All user management routes are strictly Admin-only (Receptionists cannot manage users)
router.use(protect, authorize('admin'));

router.get('/', getUsers);
router.post('/', createUser);
router.patch('/:id/status', toggleUserStatus);

module.exports = router;

