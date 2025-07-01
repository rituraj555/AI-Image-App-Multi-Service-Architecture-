const jwt = require('jsonwebtoken');

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'JWT_EXPIRE'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

/**
 * Generate a JWT token for a user
 * @param {string} userId - The user's ID
 * @param {Object} [options] - Additional options for token generation
 * @param {string} [options.expiresIn] - Token expiration time (defaults to JWT_EXPIRE from env)
 * @returns {string} JWT token
 */
const generateToken = (userId, options = {}) => {
  const {
    expiresIn = process.env.JWT_EXPIRE || '30d',
    ...jwtOptions
  } = options;

  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { 
      expiresIn,
      ...jwtOptions
    }
  );
};

/**
 * Verify a JWT token
 * @param {string} token - The JWT token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    return null;
  }
};

/**
 * Decode a JWT token without verification
 * @param {string} token - The JWT token to decode
 * @returns {Object|null} Decoded token payload or null if invalid
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error('JWT decode failed:', error.message);
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken
};
