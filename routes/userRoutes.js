const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { 
  getUserProfile,
  updateUserProfile
} = require('../controllers/userController');

const router = express.Router();

// Protect all routes with JWT authentication
router.use(protect);

// @desc    Get current user's profile
// @route   GET /api/user/profile
// @access  Private
router.get('/profile', getUserProfile);

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
router.put('/profile', updateUserProfile);

module.exports = router;
