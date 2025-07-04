// Import the Express app from server.js
const app = require('../server');

// Vercel serverless function handler
module.exports = async (req, res) => {
  // Set Vercel environment flag
  process.env.VERCEL = '1';
  
  // Handle the request using the Express app
  return app(req, res);
};
