const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { stringifyResponse } = require('./utils/stringifyAllValues');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Import routes
const authRoutes = require('./routes/authRoutes');
const coinRoutes = require('./routes/coinRoutes');
const imageRoutes = require('./routes/imageRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const userRoutes = require('./routes/userRoutes');

// Import error handler
const { errorHandler } = require('./utils/errorResponse');

// Middleware

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Convert all response values to strings
app.use(stringifyResponse);

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Explicitly serve uploads from /uploads URL path
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Test route to verify server is running
app.get('/api/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Test route is working!',
    timestamp: new Date().toISOString()
  });
});

// Debug logging for route registration
console.log('Registering routes...');

// Route middleware with debug logging
app.use('/api/auth', (req, res, next) => {
  console.log(`Auth route accessed: ${req.method} ${req.originalUrl}`);
  next();
}, authRoutes);

// Other routes
app.use('/api/coin', coinRoutes);
app.use('/api/image', imageRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/user', userRoutes);

console.log('All routes registered');

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      
      // Log environment variables (except sensitive ones)
      console.log('Environment:', process.env.NODE_ENV || 'development');
      console.log('MongoDB:', process.env.MONGO_URI ? 'Connected' : 'Not configured');
      console.log('JWT Secret:', process.env.JWT_SECRET ? 'Set' : 'Not set');
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Close server & exit process
  // server.close(() => process.exit(1));
});

startServer();

module.exports = app;

