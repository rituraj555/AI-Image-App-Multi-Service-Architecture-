const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  generateImage,
  getImageHistory,
  getImage,
  deleteImage,
  downloadImage
} = require('../controllers/imageController');

const router = express.Router();

// Public download endpoint (no authentication required)
router.get('/download/:imageId', downloadImage);

// All other routes are protected by JWT authentication
router.use(protect);

// Protected image management routes
router.post('/generate', generateImage);
router.get('/history', getImageHistory);
router.get('/:id', getImage);
router.delete('/:id', deleteImage);

module.exports = router;
