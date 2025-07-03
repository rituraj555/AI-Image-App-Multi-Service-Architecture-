const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:8000/api';
const JWT_TOKEN = 'YOUR_JWT_TOKEN'; // Replace with a valid JWT token from login
const VALID_API_KEY = 'sk-...'; // Replace with a valid Stability AI API key
const INVALID_API_KEY = 'sk-invalidkey123';

// Test data
const testPrompt = 'A beautiful sunset over mountains, digital art';

/**
 * Test image generation with different API key scenarios
 */
async function testImageGeneration() {
  console.log('Starting image generation tests...\n');

  // 1. Test with no API key
  console.log('Test 1: No API key provided');
  await testApiCall({}, 'Should fail with 400 Bad Request');

  // 2. Test with invalid API key format
  console.log('\nTest 2: Invalid API key format');
  await testApiCall(
    { 'x-stability-api-key': 'invalid-key' },
    'Should fail with 400 Bad Request (invalid format)'
  );

  // 3. Test with invalid API key (valid format but incorrect)
  console.log('\nTest 3: Invalid API key (valid format)');
  await testApiCall(
    { 'x-stability-api-key': INVALID_API_KEY },
    'Should fail with 401 Unauthorized'
  );

  // 4. Test with valid API key
  console.log('\nTest 4: Valid API key');
  await testApiCall(
    { 'x-stability-api-key': VALID_API_KEY },
    'Should succeed with 200 OK and return generated images'
  );

  console.log('\nAll tests completed');
}

/**
 * Helper function to test API calls
 */
async function testApiCall(headers, description) {
  try {
    console.log(`- ${description}`);
    
    const response = await axios.post(
      `${BASE_URL}/image/generate`,
      {
        prompt: testPrompt,
        samples: 1,
        steps: 10 // Use fewer steps for testing
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JWT_TOKEN}`,
          ...headers
        },
        // Don't throw on HTTP error status codes
        validateStatus: () => true
      }
    );

    console.log(`  Status: ${response.status} ${response.statusText}`);
    
    if (response.data.success) {
      console.log('  ✅ Success!');
      console.log(`  Images generated: ${response.data.data.images.length}`);
      console.log(`  Coins used: ${response.data.data.coinsUsed}`);
      console.log(`  Remaining coins: ${response.data.data.remainingCoins}`);
      
      // Save the first image (if any)
      if (response.data.data.images.length > 0) {
        const imageData = response.data.data.images[0].imageData;
        if (imageData) {
          const base64Data = imageData.replace(/^data:image\/png;base64,/, '');
          const outputPath = path.join(__dirname, `test-image-${Date.now()}.png`);
          fs.writeFileSync(outputPath, base64Data, 'base64');
          console.log(`  Image saved to: ${outputPath}`);
        }
      }
    } else {
      console.log('  ❌ Failed:', response.data.error);
    }
  } catch (error) {
    console.error('  ❌ Error:', error.message);
    if (error.response) {
      console.log('  Response data:', error.response.data);
    }
  }
}

// Run the tests
if (require.main === module) {
  if (!JWT_TOKEN || JWT_TOKEN === 'YOUR_JWT_TOKEN') {
    console.error('Error: Please set a valid JWT_TOKEN in the script');
    process.exit(1);
  }
  
  if (!VALID_API_KEY || VALID_API_KEY === 'sk-...') {
    console.error('Error: Please set a valid VALID_API_KEY in the script');
    process.exit(1);
  }
  
  testImageGeneration().catch(console.error);
}

module.exports = { testImageGeneration };
