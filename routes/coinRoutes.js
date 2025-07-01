const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  buyCoins,
  earnCoins,
  deductCoins,
  getBalance,
  getTransactionHistory
} = require('../controllers/coinController');

const router = express.Router();

// All routes are protected by JWT authentication
router.use(protect);

// Coin management routes
router.post('/buy', buyCoins);
router.post('/earn', earnCoins);
router.post('/deduct', deductCoins);
router.get('/balance', getBalance);
router.get('/transactions', getTransactionHistory);

module.exports = router;
