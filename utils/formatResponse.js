/**
 * Formats MongoDB documents for JSON responses
 * Converts ObjectIds to strings and Dates to ISO strings
 */
function formatDocument(doc) {
  if (!doc) return doc;
  
  // Handle arrays
  if (Array.isArray(doc)) {
    return doc.map(formatDocument);
  }
  
  // Handle MongoDB documents
  if (doc._id && typeof doc._id === 'object' && doc._id.toString) {
    doc = { ...doc.toObject() };
  } else if (doc.toString) {
    // Handle ObjectId
    if (doc._bsontype === 'ObjectID') {
      return doc.toString();
    }
    // Handle Date
    if (doc instanceof Date) {
      return doc.toISOString();
    }
    return doc;
  }
  
  // Process all properties
  const result = {};
  for (const key in doc) {
    if (doc.hasOwnProperty(key)) {
      const value = doc[key];
      
      if (value && typeof value === 'object') {
        if (value._bsontype === 'ObjectID' || (value.id && value._bsontype === 'ObjectID')) {
          result[key] = value.toString();
        } else if (value instanceof Date) {
          result[key] = value.toISOString();
        } else if (value.buffer && value._bsontype === 'Binary') {
          // Handle Binary data (like ObjectId buffer)
          result[key] = value.toString('hex');
        } else if (Array.isArray(value)) {
          result[key] = value.map(formatDocument);
        } else if (value && typeof value === 'object') {
          result[key] = formatDocument(value);
        } else {
          result[key] = value;
        }
      } else {
        result[key] = value;
      }
    }
  }
  
  return result;
}

/**
 * Middleware to format response data before sending
 */
function formatResponse(req, res, next) {
  const originalJson = res.json;
  
  res.json = function(data) {
    // Only format if it's a successful response
    if (data && (data.success || res.statusCode < 400)) {
      data = formatDocument(data);
    }
    originalJson.call(this, data);
  };
  
  next();
}

module.exports = {
  formatDocument,
  formatResponse
};
