// Test script to verify auth endpoints return hex string IDs
const axios = require('axios');

const BASE_URL = 'http://localhost:8000/api';

// Helper function to check if a string is a valid hex string
function isHexString(str) {
  return typeof str === 'string' && /^[0-9a-fA-F]+$/.test(str);
}

// Test user credentials
const testUser = {
  name: 'Test User ' + Math.floor(Math.random() * 10000),
  email: `testuser${Math.floor(Math.random() * 10000)}@example.com`,
  password: 'Test@1234'
};

console.log('Testing auth endpoints...');
console.log('Test user email:', testUser.email);

// Test register endpoint
async function testRegister() {
  try {
    console.log('\n=== Testing /api/auth/register ===');
    const response = await axios.post(`${BASE_URL}/auth/register`, testUser);
    
    console.log('Status:', response.status);
    
    // Check if the response has the expected structure
    if (response.data && response.data.success && response.data.user) {
      console.log('✅ Register successful');
      
      // Check if IDs are hex strings
      const idIsHex = isHexString(response.data.id);
      const userIdIsHex = isHexString(response.data.user.id);
      
      console.log(`ID is hex string: ${idIsHex ? '✅' : '❌'}`);
      console.log(`User ID is hex string: ${userIdIsHex ? '✅' : '❌'}`);
      
      if (idIsHex && userIdIsHex) {
        console.log('✅ All IDs are in hex string format');
      } else {
        console.log('❌ Some IDs are not in hex string format');
      }
      
      // Return the token for the next test
      return response.data.token;
    } else {
      console.log('❌ Unexpected response format:', response.data);
      return null;
    }
  } catch (error) {
    console.error('❌ Register test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
    return null;
  }
}

// Test login endpoint
async function testLogin(token) {
  if (!token) {
    console.log('Skipping login test - no token from register');
    return null;
  }
  
  try {
    console.log('\n=== Testing /api/auth/login ===');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    console.log('Status:', response.status);
    
    // Check if the response has the expected structure
    if (response.data && response.data.success && response.data.user) {
      console.log('✅ Login successful');
      
      // Check if IDs are hex strings
      const idIsHex = isHexString(response.data.id);
      const userIdIsHex = isHexString(response.data.user.id);
      
      console.log(`ID is hex string: ${idIsHex ? '✅' : '❌'}`);
      console.log(`User ID is hex string: ${userIdIsHex ? '✅' : '❌'}`);
      
      if (idIsHex && userIdIsHex) {
        console.log('✅ All IDs are in hex string format');
      } else {
        console.log('❌ Some IDs are not in hex string format');
      }
      
      return response.data.token;
    } else {
      console.log('❌ Unexpected response format:', response.data);
      return null;
    }
  } catch (error) {
    console.error('❌ Login test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
    return null;
  }
}

// Test getMe endpoint
async function testGetMe(token) {
  if (!token) {
    console.log('Skipping getMe test - no token');
    return;
  }
  
  try {
    console.log('\n=== Testing /api/auth/me ===');
    const response = await axios.get(`${BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Status:', response.status);
    
    // Check if the response has the expected structure
    if (response.data && response.data.success && response.data.user) {
      console.log('✅ GetMe successful');
      
      // Check if user ID is a hex string
      const userIdIsHex = isHexString(response.data.user.id);
      
      console.log(`User ID is hex string: ${userIdIsHex ? '✅' : '❌'}`);
      
      if (userIdIsHex) {
        console.log('✅ User ID is in hex string format');
      } else {
        console.log('❌ User ID is not in hex string format');
      }
    } else {
      console.log('❌ Unexpected response format:', response.data);
    }
  } catch (error) {
    console.error('❌ GetMe test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Run all tests
async function runTests() {
  console.log('Starting auth endpoint tests...');
  
  // Test register
  const token = await testRegister();
  
  // Test login with the same credentials
  const loginToken = await testLogin();
  
  // Test getMe with the token from login
  await testGetMe(loginToken);
  
  console.log('\n=== Test completed ===');
}

// Run the tests
runTests().catch(console.error);
