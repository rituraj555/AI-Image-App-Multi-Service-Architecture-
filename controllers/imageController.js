const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { ErrorResponse } = require('../utils/errorResponse');
const { transformBufferObjects } = require('../utils/transformResponse');
const Image = require('../models/Image');
const User = require('../models/User');

// Configuration from environment variables
const COST_PER_IMAGE = parseInt(process.env.COST_PER_IMAGE) || 5; // Reduced cost for SD 1.5
const DEFAULT_MODEL = 'stable-diffusion-v1-5';
const STABILITY_API_BASE_URL = process.env.STABILITY_API_URL?.split('/v1/')[0] || 'https://api.stability.ai';
const STABILITY_API_URL = `${STABILITY_API_BASE_URL}/v1/generation/${DEFAULT_MODEL}/text-to-image`;
const STABILITY_API_KEY_VALIDATION_URL = `${STABILITY_API_BASE_URL}/v1/user/account`;

// Validation constants
const API_KEY_PREFIX = 'sk-';
const MIN_API_KEY_LENGTH = 40; // sk- prefix + at least 36 characters
const VALID_DIMENSIONS = [512, 768]; // SD 1.5 works best with these dimensions

/**
 * Validates a Stability AI API key by making a test request
 * @param {string} apiKey - The API key to validate
 * @returns {Promise<boolean>} - True if valid, false otherwise
 */
async function validateStabilityApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== 'string' || 
      !apiKey.startsWith(API_KEY_PREFIX) || 
      apiKey.length < MIN_API_KEY_LENGTH) {
    return false;
  }

  try {
    const response = await axios.get(STABILITY_API_KEY_VALIDATION_URL, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      },
      timeout: 5000 // 5 second timeout for validation
    });
    
    return response.status === 200 && response.data?.email;
  } catch (error) {
    console.error('API key validation failed:', error.message);
    return false;
  }
}

// @desc    Generate AI image
// @route   POST /api/image/generate
// @access  Private
exports.generateImage = async (req, res, next) => {
  const session = await Image.startSession();
  session.startTransaction();

  try {
    const { prompt, stylePreset, negativePrompt, width, height, samples, cfgScale, steps, seed } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!prompt) {
      return next(new ErrorResponse('Prompt is required', 400));
    }

    // Get user's API key from headers
    const apiKey = req.headers['x-stability-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    
    if (!apiKey) {
      return next(new ErrorResponse('Stability AI API key is required. Please provide it in the x-stability-api-key header.', 400));
    }

    // Validate API key format
    if (!apiKey.startsWith(API_KEY_PREFIX) || apiKey.length < MIN_API_KEY_LENGTH) {
      return next(new ErrorResponse('Invalid API key format', 400));
    }

    // Check user's coin balance
    const user = await User.findById(userId).session(session);
    if (user.coins < COST_PER_IMAGE) {
      return next(new ErrorResponse('Insufficient coins', 400));
    }
    
    // Validate dimensions for SD 1.5
    const imgWidth = parseInt(width);
    const imgHeight = parseInt(height);
    
    if (!VALID_DIMENSIONS.includes(imgWidth) || !VALID_DIMENSIONS.includes(imgHeight)) {
      return next(new ErrorResponse(
        `SD 1.5 only supports the following dimensions: ${VALID_DIMENSIONS.join('x')}`, 
        400
      ));
    }

    // Prepare the request payload for SD 1.5
    const payload = {
      text_prompts: [
        {
          text: prompt.trim(),
          weight: 1.0
        }
      ],
      cfg_scale: Math.min(Math.max(parseFloat(cfgScale) || 7, 1), 35), // Clamp 1-35
      height: imgHeight,
      width: imgWidth,
      samples: Math.min(parseInt(samples) || 1, 4), // Max 4 samples per request
      steps: Math.min(Math.max(parseInt(steps) || 30, 10), 50), // Clamp 10-50 steps
      seed: seed || Math.floor(Math.random() * 4294967295) // Full 32-bit range
    };

    // SD 1.5 handles negative prompts differently
    const fullPrompt = negativePrompt && negativePrompt.trim() !== ''
      ? `${prompt} ### ${negativePrompt}`
      : prompt;
      
    payload.text_prompts[0].text = fullPrompt.trim();
    if (negativePrompt && negativePrompt.trim() !== '') {
      payload.text_prompts.push({
        text: negativePrompt.trim(),
        weight: -1.0
      });
    }

    // Call Stability AI API
    console.log('Calling Stability AI API with payload:', JSON.stringify(payload, null, 2));
    console.log('API URL:', STABILITY_API_URL);
    
    const response = await axios.post(
      STABILITY_API_URL,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Version': '2023-08-16-preview',
          'Authorization': `Bearer ${apiKey}`
        },
        responseType: 'json',
        timeout: parseInt(process.env.STABILITY_API_TIMEOUT) || 30000
      }
    ).catch(error => {
      console.error('Stability AI API Error:', {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : 'No response',
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers ? {
            ...error.config.headers,
            'Authorization': '[REDACTED]' // Don't log the actual API key
          } : 'No headers',
          data: error.config?.data
        }
      });
      throw error;
    });
    
    console.log('Stability AI API Response Status:', response.status);
    console.log('Response data keys:', Object.keys(response.data));
    console.log('Response data.artifacts exists:', !!response.data.artifacts);
    if (response.data.artifacts) {
      console.log('Artifacts array length:', response.data.artifacts.length);
      if (response.data.artifacts.length > 0) {
        console.log('First artifact keys:', Object.keys(response.data.artifacts[0]));
      }
    }

    if (!response.data.artifacts || !response.data.artifacts.length) {
      console.error('No artifacts in response:', JSON.stringify(response.data, null, 2));
      throw new Error('No image was generated by the AI service');
    }
    
    // Check if any of the artifacts have an error
    const errorArtifact = response.data.artifacts.find(art => art.type === 'error');
    if (errorArtifact) {
      throw new Error(`AI service error: ${errorArtifact.message || 'Unknown error'}`);
    }

    // Deduct coins from user
    user.coins -= COST_PER_IMAGE;
    await user.save({ session });

    // Process the generated images
    const imageArtifacts = [];
    
    for (const artifact of response.data.artifacts) {
      const imageId = uuidv4();
      
      // Save image to storage
      let imageUrl;
      try {
        imageUrl = await saveImageToStorage(artifact.base64, imageId);
      } catch (storageError) {
        console.error('Failed to save image to storage:', storageError);
        // Continue with the response even if storage fails, as we still have the base64 data
        imageUrl = null;
      }
      
      // Create image record in database
      const newImage = new Image({
        userId,
        prompt,
        imageUrl,  // Still store the URL if you want to keep track of it
        imageId,
        coinsUsed: COST_PER_IMAGE,
        size: {
          width: width || 1024,
          height: height || 1024
        },
        model: 'stable-diffusion-xl-1024-v1-0',
        stylePreset: stylePreset || 'digital-art',
        negativePrompt: negativePrompt || '',
        cfgScale: cfgScale || 7,
        steps: steps || 30,
        seed: seed || 0,
        samples: samples || 1
      });

      await newImage.save({ session });
      
      // Include base64 data in the response
      imageArtifacts.push({
        id: newImage._id,
        imageData: `data:image/png;base64,${artifact.base64}`, // Base64 data URL
        imageUrl: imageUrl, // Still include URL if needed
        prompt: newImage.prompt,
        createdAt: newImage.createdAt
      });
    }

    await session.commitTransaction();
    session.endSession();

    // Prepare the response
    const responseData = {
      success: true,
      data: {
        images: imageArtifacts,
        coinsUsed: COST_PER_IMAGE * imageArtifacts.length,
        remainingCoins: user.coins
      }
    };

    // Transform buffer objects in the response
    const transformedResponse = transformBufferObjects(responseData);

    res.status(201).json(transformedResponse);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Image generation error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config ? {
        url: error.config.url,
        method: error.config.method,
        headers: error.config.headers ? {
          ...error.config.headers,
          'Authorization': error.config.headers.Authorization ? '[REDACTED]' : undefined
        } : {},
        data: error.config.data
      } : {}
    });
    
    const errorMessage = error.response?.data?.message || error.message || 'Failed to generate image';
    next(new ErrorResponse(`Image generation failed: ${errorMessage}`, error.response?.status || 500));
  }
};

// @desc    Get user's image generation history
// @route   GET /api/image/history
// @access  Private
exports.getImageHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [images, total] = await Promise.all([
      Image.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Image.countDocuments({ userId: req.user.id })
    ]);

    res.status(200).json({
      success: true,
      count: images.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: images
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single generated image
// @route   GET /api/image/:id
// @access  Private
exports.getImage = async (req, res, next) => {
  try {
    const image = await Image.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!image) {
      return next(new ErrorResponse('Image not found', 404));
    }

    res.status(200).json({
      success: true,
      data: image
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a generated image
// @route   DELETE /api/image/:id
// @access  Private
exports.deleteImage = async (req, res, next) => {
  try {
    const image = await Image.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!image) {
      return next(new ErrorResponse('Image not found', 404));
    }

    // Delete the image file from storage
    await deleteImageFromStorage(image.imageId);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to save image to storage (example implementation)
async function saveImageToStorage(base64Data, imageId) {
  // In a production environment, you would upload to a cloud storage service like AWS S3, Google Cloud Storage, etc.
  // This is a simplified example that saves to the local filesystem
  
  try {
    const uploadDir = path.join(__dirname, '../../public/uploads');
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const filePath = path.join(uploadDir, `${imageId}.png`);
    const buffer = Buffer.from(base64Data, 'base64');
    
    await fs.promises.writeFile(filePath, buffer);
    
    // In a real app, return the public URL of the uploaded file
    return `/uploads/${imageId}.png`;
  } catch (error) {
    console.error('Error saving image:', error);
    throw new Error('Failed to save image');
  }
}

// Helper function to delete image from storage
async function deleteImageFromStorage(imageId) {
  try {
    const filePath = path.join(__dirname, '../../public/uploads', `${imageId}.png`);
    
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Failed to delete image');
  }
}
