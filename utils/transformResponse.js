/**
 * Transforms buffer objects in the response to hexadecimal strings
 * @param {Object} data - The response data to transform
 * @returns {Object} - Transformed data with buffer objects converted to hex strings
 */
function transformBufferObjects(data) {
    if (!data || typeof data !== 'object') {
        return data;
    }

    // Handle arrays
    if (Array.isArray(data)) {
        return data.map(item => transformBufferObjects(item));
    }

    // Handle objects
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
            
            // Recursively process nested objects/arrays
            result[key] = transformBufferObjects(value);
        }
    }
    
    return result;
}

module.exports = {
    transformBufferObjects
};
