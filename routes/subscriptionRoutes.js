const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { 
  verifySubscription,
  getSubscriptionStatus 
} = require('../controllers/subscriptionController');

const router = express.Router();

// Protect all routes with JWT authentication
router.use(protect);

// @desc    Verify Google Play subscription
// @route   POST /api/subscription/verify
// @access  Private
router.post('/verify', verifySubscription);

// @desc    Get current user's subscription status
// @route   GET /api/subscription/status
// @access  Private
router.get('/status', getSubscriptionStatus);

module.exports = router;
