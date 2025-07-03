const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
  console.log(`Auth route hit: ${req.method} ${req.originalUrl}`);
  next();
});

// Public routes
router.post('/register', (req, res, next) => {
  console.log('Register route hit');
  register(req, res, next);
});

router.post('/login', (req, res, next) => {
  console.log('Login route hit');
  login(req, res, next);
});

// Protected route
router.get('/me', protect, (req, res, next) => {
  console.log('Get me route hit');
  getMe(req, res, next);
});

console.log('Auth routes initialized');

module.exports = router;
