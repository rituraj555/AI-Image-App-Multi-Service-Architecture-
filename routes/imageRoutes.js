const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  generateImage,
  getImageHistory,
  getImage,
  deleteImage
} = require('../controllers/imageController');

const router = express.Router();

// All routes are protected by JWT authentication
router.use(protect);

// Image generation and management routes
router.post('/generate', generateImage);
router.get('/history', getImageHistory);
router.get('/:id', getImage);
router.delete('/:id', deleteImage);

module.exports = router;
