// Test script to verify buffer to hex string transformation

// Mock response data with buffer objects
const testData = {
  id: { buffer: { "0": "104", "1": "102", "2": "106" } },
  user: {
    id: { buffer: { "0": "97", "1": "98", "2": "99" } },
    name: "Test User"
  },
  items: [
    { id: { buffer: { "0": "49", "1": "50", "2": "51" } } },
    { id: "already-a-string" }
  ]
};

// Our transformation function
function transformBufferObjects(data) {
  if (!data || typeof data !== 'object') {
    return data;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => transformBufferObjects(item));
  }

  const result = {};
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const value = data[key];
      
      // Check if this is a buffer object (has buffer property with numeric keys)
      if (key === 'id' || key === 'user.id') {
        if (value && typeof value === 'object' && value.buffer) {
          const buffer = value.buffer;
          const bufferValues = [];
          let hasNumericKeys = false;
          
          // Collect numeric keys in order
          for (const k in buffer) {
            if (Object.prototype.hasOwnProperty.call(buffer, k) && !isNaN(parseInt(k))) {
              bufferValues[parseInt(k)] = buffer[k];
              hasNumericKeys = true;
            }
          }
          
          // If we found numeric keys, convert to hex string
          if (hasNumericKeys) {
            // Convert each number to hex and join
            result[key] = bufferValues
              .map(num => parseInt(num).toString(16).padStart(2, '0'))
              .join('');
            continue;
          }
        } else if (typeof value === 'string') {
          // If it's already a string, keep it as is
          result[key] = value;
          continue;
        }
      }
      
      // Handle nested 'user.id' path
      if (key === 'user' && value && typeof value === 'object' && value.id) {
        const userValue = value.id;
        if (userValue && typeof userValue === 'object' && userValue.buffer) {
          const buffer = userValue.buffer;
          const bufferValues = [];
          let hasNumericKeys = false;
          
          // Collect numeric keys in order
          for (const k in buffer) {
            if (Object.prototype.hasOwnProperty.call(buffer, k) && !isNaN(parseInt(k))) {
              bufferValues[parseInt(k)] = buffer[k];
              hasNumericKeys = true;
            }
          }
          
          // If we found numeric keys, convert to hex string
          if (hasNumericKeys) {
            result[key] = {
              ...value,
              id: bufferValues
                .map(num => parseInt(num).toString(16).padStart(2, '0'))
                .join('')
            };
            continue;
          }
        }
      }
      
      // Recursively process nested objects/arrays
      result[key] = transformBufferObjects(value);
    }
  }
  
  return result;
}

// Run the test
console.log('Input:');
console.log(JSON.stringify(testData, null, 2));

console.log('\nOutput:');
const transformed = transformBufferObjects(testData);
console.log(JSON.stringify(transformed, null, 2));

// Verify the output
function testTransformation() {
  const transformed = transformBufferObjects(testData);
  
  // Test 1: Top-level id should be hex string
  const test1 = typeof transformed.id === 'string' && /^[0-9a-f]+$/.test(transformed.id);
  console.log(`Test 1 - Top-level id is hex string: ${test1 ? 'PASS' : 'FAIL'}`);
  
  // Test 2: user.id should be hex string
  const test2 = typeof transformed.user.id === 'string' && /^[0-9a-f]+$/.test(transformed.user.id);
  console.log(`Test 2 - user.id is hex string: ${test2 ? 'PASS' : 'FAIL'}`);
  
  // Test 3: Array item with buffer id should be hex string
  const test3 = typeof transformed.items[0].id === 'string' && /^[0-9a-f]+$/.test(transformed.items[0].id);
  console.log(`Test 3 - Array item buffer id is hex string: ${test3 ? 'PASS' : 'FAIL'}`);
  
  // Test 4: Already string id should remain unchanged
  const test4 = transformed.items[1].id === 'already-a-string';
  console.log(`Test 4 - String id remains unchanged: ${test4 ? 'PASS' : 'FAIL'}`);
  
  // Test 5: Non-id buffer objects should remain unchanged
  const test5 = JSON.stringify(transformed.user.name) === JSON.stringify(testData.user.name);
  console.log(`Test 5 - Non-id fields remain unchanged: ${test5 ? 'PASS' : 'FAIL'}`);
  
  return test1 && test2 && test3 && test4 && test5;
}

console.log('\nRunning tests...');
const allTestsPassed = testTransformation();
console.log(`\nAll tests ${allTestsPassed ? 'PASSED' : 'FAILED'}`);

if (!allTestsPassed) {
  process.exit(1);
}
