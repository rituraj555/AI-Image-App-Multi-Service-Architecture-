const jwt = require('jsonwebtoken');
const { ErrorResponse } = require('../utils/errorResponse');

/**
 * Middleware to verify JWT token and attach user ID to request object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const protect = (req, res, next) => {
  // Get token from header
  let token;
  
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Extract token from header
    // Format: Bearer <token>
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user ID to request object
    req.userId = decoded.id;
    
    // Call next middleware
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

/**
 * Middleware to check if user has required roles
 * @param {...String} roles - Roles that are allowed to access the route
 * @returns {Function} Express middleware function
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new ErrorResponse(`User not found in request object`, 500)
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

module.exports = {
  protect,
  authorize
};
