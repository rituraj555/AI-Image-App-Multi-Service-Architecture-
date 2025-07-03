/**
 * Converts all values in an object (including nested) to strings
 * Handles: ObjectId, Date, null, undefined, boolean, number, nested objects, and arrays
 * @param {any} data - The data to process
 * @returns {any} - New object with all values as strings
 */
function stringifyAllValues(data) {
  // Handle null/undefined
  if (data === null || data === undefined) {
    return String(data);
  }
  
  // Handle MongoDB ObjectId
  if (data._bsontype === 'ObjectID' || (data.id && data._bsontype === 'ObjectID')) {
    return data.toString();
  }
  
  // Handle Date objects
  if (data instanceof Date) {
    return data.toISOString();
  }
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => stringifyAllValues(item));
  }
  
  // Handle objects (but not null, which was handled above)
  if (typeof data === 'object') {
    const result = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[key] = stringifyAllValues(data[key]);
      }
    }
    return result;
  }
  
  // Handle primitive types (boolean, number, string, etc.)
  return String(data);
}

/**
 * Express middleware to stringify all response values
 */
function stringifyResponse(req, res, next) {
  const originalJson = res.json;
  
  res.json = function(data) {
    // Only process successful responses
    if (data && (data.success || res.statusCode < 400)) {
      data = stringifyAllValues(data);
    }
    originalJson.call(this, data);
  };
  
  next();
}

module.exports = {
  stringifyAllValues,
  stringifyResponse
};
