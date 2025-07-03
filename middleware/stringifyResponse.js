/**
 * Middleware to convert all response values to strings
 */
function stringifyResponse(req, res, next) {
  const originalJson = res.json;
  
  res.json = function(data) {
    function convertToStr(obj) {
      if (obj === null) return 'null';
      if (typeof obj === 'object') {
        if (Array.isArray(obj)) {
          return obj.map(item => convertToStr(item));
        }
        const result = {};
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            result[key] = convertToStr(obj[key]);
          }
        }
        return result;
      }
      return String(obj);
    }

    const stringifiedData = convertToStr(data);
    originalJson.call(this, stringifiedData);
  };
  
  next();
}

module.exports = stringifyResponse;
