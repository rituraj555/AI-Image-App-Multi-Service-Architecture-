const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { uploadToCloudinary } = require('../config/cloudinary');
const { ErrorResponse } = require('../utils/errorResponse');
const { transformBufferObjects } = require('../utils/transformResponse');
const { deleteFromCloudinary } = require('../config/cloudinary');
const Image = require('../models/Image');
const User = require('../models/User');
const { RateLimiter } = require('limiter');

// Configure rate limiter for Stability AI API (3 requests per second)
const stabilityLimiter = new RateLimiter({
  tokensPerInterval: 100,
  interval: 'second',
  fireImmediately: false
});

/**
 * Makes an API request with retry logic and exponential backoff
 * @param {Object} config - Axios request config
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} retryDelay - Initial retry delay in milliseconds
 * @returns {Promise<Object>} - API response
 */
async function makeApiRequestWithRetry(config, maxRetries = 3, retryDelay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Wait for rate limiter before making the request
      await stabilityLimiter.removeTokens(1);
      
      const response = await axios(config);
      return response;
    } catch (error) {
      lastError = error;
      
      // If it's a rate limit error, wait and retry
      if (error.response?.status === 429) {
        const retryAfter = error.response?.headers?.['retry-after'] || Math.min(1000 * Math.pow(2, attempt), 30000);
        console.warn(`Rate limited. Retrying in ${retryAfter}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, retryAfter));
        continue;
      }
      
      // For other errors, rethrow immediately
      throw error;
    }
  }
  
  // If we've exhausted all retries, throw the last error
  throw lastError || new Error('Max retries exceeded');
}

// Constants
const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
const COST_PER_IMAGE_SD15 = parseInt(process.env.COST_PER_IMAGE_SD15) || 5; // Reduced cost for SD 1.5
const COST_PER_IMAGE_SD16 = parseInt(process.env.COST_PER_IMAGE_SD16) || 10; // Cost for SD 1.6
const STABILITY_API_URL_SD15 = 'https://api.stability.ai/v1/generation/stable-diffusion-v1-5/text-to-image';
const STABILITY_API_URL_SD16 = 'https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image';
const MIN_DIMENSION = 320;
const MAX_DIMENSION = 1536;
const DIMENSION_STEP = 64;

// Cost per image generation in coins
const COST_PER_IMAGE = process.env.COST_PER_IMAGE ? parseInt(process.env.COST_PER_IMAGE, 10) : 10; // Load from .env or use defaults

// Configuration from environment variables
const DEFAULT_MODEL = process.env.DEFAULT_MODEL || 'stable-diffusion-v1-5';
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

/**
 * @desc    Generate AI image using Stable Diffusion v1.6
 * @route   POST /api/image/generate
 * @access  Private
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @param   {Function} next - Express next middleware function
 * @returns {Object} JSON response with generated image data
 */
exports.generateImage = async (req, res, next) => {
  const session = await Image.startSession();
  session.startTransaction();

  try {
    const { 
      prompt, 
      style = 'realistic', // Default to realistic style
      negativePrompt, 
      width = 512, 
      height = 512, 
      samples = 1, 
      cfg_scale = 7, 
      steps = 30, 
      seed,
      clip_guidance_preset,
      sampler
    } = req.body;
    
    const userId = req.user.id;

    // Validate required fields
    if (!prompt) {
      return next(new ErrorResponse('Prompt is required', 400));
    }

    // Check if API key is configured
    if (!STABILITY_API_KEY) {
      return next(new ErrorResponse('Stability AI API key is not configured', 500));
    }

    // Validate dimensions
    const imgWidth = parseInt(width);
    const imgHeight = parseInt(height);
    
    if (isNaN(imgWidth) || isNaN(imgHeight)) {
      return next(new ErrorResponse('Width and height must be valid numbers', 400));
    }
    
    if (imgWidth < MIN_DIMENSION || imgWidth > MAX_DIMENSION || 
        imgHeight < MIN_DIMENSION || imgHeight > MAX_DIMENSION) {
      return next(new ErrorResponse(
        `Dimensions must be between ${MIN_DIMENSION} and ${MAX_DIMENSION} pixels`,
        400
      ));
    }
    
    if (imgWidth % DIMENSION_STEP !== 0 || imgHeight % DIMENSION_STEP !== 0) {
      return next(new ErrorResponse(
        `Dimensions must be multiples of ${DIMENSION_STEP} pixels`,
        400
      ));
    }

    // Check user's coin balance
    const user = await User.findById(userId).session(session);
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }
    
    const totalCost = COST_PER_IMAGE * Math.min(parseInt(samples) || 1, 10);
    if (user.coins < totalCost) {
      return next(new ErrorResponse(
        `Insufficient coins. Required: ${totalCost}, Available: ${user.coins}`,
        400
      ));
    }

    // Prepare the request payload for SD v1.6
    const payload = {
      text_prompts: [
        {
          text: prompt.trim(),
          weight: 1.0
        }
      ],
      cfg_scale: Math.min(Math.max(parseFloat(cfg_scale), 0), 35) || 7,
      height: imgHeight,
      width: imgWidth,
      samples: Math.min(parseInt(samples), 10) || 1,
      steps: Math.min(Math.max(parseInt(steps), 10), 50) || 30,
      seed: seed || Math.floor(Math.random() * 4294967295) // 32-bit integer
    };

    // Add negative prompt if provided
    if (negativePrompt && negativePrompt.trim() !== '') {
      payload.text_prompts.push({
        text: negativePrompt.trim(),
        weight: -1.0
      });
    }
    
    // Add optional parameters if provided
    if (style && style !== 'none') {
      payload.style_preset = style;
    }
    if (clip_guidance_preset) payload.clip_guidance_preset = clip_guidance_preset;
    if (sampler) payload.sampler = sampler;

    // Call Stability AI API with retry logic
    console.log('Calling Stability AI API with payload:', JSON.stringify(payload, null, 2));
    
    let response;
    try {
      response = await makeApiRequestWithRetry({
        method: 'post',
        url: STABILITY_API_URL_SD16,
        data: payload,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${STABILITY_API_KEY}`
        },
        responseType: 'json',
        timeout: parseInt(process.env.STABILITY_API_TIMEOUT) || 90000 // 90 seconds timeout
      });
    } catch (error) {
      const errorInfo = {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      };
      
      console.error('Stability AI API Error:', JSON.stringify(errorInfo, null, 2));
      
      // Handle rate limiting
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        throw new Error('Invalid API key. Please check your configuration.');
      }
      
      throw new Error(error.response?.data?.message || 'Failed to generate image');
    }
    
    // Check if we have a valid response with artifacts
    if (!response?.data?.artifacts?.length) {
      console.error('No artifacts in response:', JSON.stringify(response.data, null, 2));
      throw new Error('No image was generated by the AI service');
    }
    
    // Check for errors in artifacts
    const errorArtifact = response.data.artifacts.find(art => art.type === 'error');
    if (errorArtifact) {
      throw new Error(`AI service error: ${errorArtifact.message || 'Unknown error'}`);
    }

    // Deduct coins from user
    user.coins -= totalCost;
    await user.save({ session });

    // Process each generated image
    const generatedImages = [];
    
    // Ensure we have valid artifacts to process
    if (!Array.isArray(response.data.artifacts)) {
      throw new Error('Invalid response format from AI service: missing artifacts array');
    }
    
    for (const artifact of response.data.artifacts) {
      if (artifact.finishReason === 'SUCCESS') {
        const imageId = uuidv4();
        
        try {
          // Upload to Cloudinary
          const { url: imageUrl, public_id: cloudinaryPublicId } = await uploadToCloudinary(
            artifact.base64,
            'ai-generated-images'
          );
          
          // Create image record in database
          const newImage = new Image({
            userId: req.user.id,
            prompt: req.body.prompt,
            imageUrl,
            imageId,
            cloudinaryPublicId,
            coinsUsed: COST_PER_IMAGE_SD16,
            size: {
              width: parseInt(req.body.width) || 512,
              height: parseInt(req.body.height) || 512
            },
            model: 'stable-diffusion-v1-6',
            style: style,
            negativePrompt: req.body.negativePrompt || null,
            cfgScale: parseFloat(req.body.cfg_scale) || 7,
            steps: parseInt(req.body.steps) || 30,
            seed: req.body.seed || Math.floor(Math.random() * 4294967295),
            samples: parseInt(req.body.samples) || 1
          });

          await newImage.save({ session });
          
          // Prepare response data
          generatedImages.push({
            id: newImage._id,
            imageId: newImage.imageId,
            prompt: newImage.prompt,
            imageUrl: newImage.imageUrl,
            cloudinaryPublicId: newImage.cloudinaryPublicId,
            downloadUrl: `${req.protocol}://${req.get('host')}/api/image/download/${newImage.imageId}`,
            size: newImage.size,
            model: newImage.model,
            stylePreset: newImage.stylePreset,
            negativePrompt: newImage.negativePrompt,
            cfgScale: newImage.cfgScale,
            steps: newImage.steps,
            seed: newImage.seed,
            samples: newImage.samples,
            coinsUsed: COST_PER_IMAGE_SD16,
            createdAt: newImage.createdAt,
            downloaded: newImage.downloaded
          });
        } catch (uploadError) {
          console.error('Error uploading to Cloudinary:', uploadError);
          throw new Error('Failed to upload image to Cloudinary');
        }
      }
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Prepare the response with image data
    const responseData = {
      success: true,
      data: {
        images: generatedImages,
        coinsUsed: totalCost,
        remainingCoins: user.coins - totalCost
      }
    };

    // Transform buffer objects in the response if needed
    const transformedResponse = transformBufferObjects ? 
      transformBufferObjects(responseData) : responseData;

    // Send the response with image metadata (no base64)
    // Images can be downloaded once via the downloadUrl
    res.status(201).json(transformedResponse);
  } catch (error) {
    await session.abortTransaction().catch(console.error);
    session.endSession().catch(console.error);
    
    console.error('Image generation error:', {
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
      name: error.name,
      code: error.code,
      status: error.response?.status
    });
    
    next(new ErrorResponse(
      error.message || 'Failed to generate image',
      error.statusCode || error.response?.status || 500
    ));
  }
};

/**
 * @desc    Get user's image generation history
 * @route   GET /api/image/history
 * @access  Private
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @param   {Function} next - Express next middleware function
 * @returns {Object} JSON response with paginated image history
 */
exports.getImageHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, model, startDate, endDate } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(Math.max(parseInt(limit), 1), 50); // Max 50 items per page
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query = { userId: req.user.id };
    
    // Add model filter if provided
    if (model) {
      query.model = model;
    }
    
    // Add date range filter if provided
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    const [images, total] = await Promise.all([
      Image.find(query)
        .select('-__v -updatedAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Image.countDocuments(query)
    ]);

    // Sanitize and format the response
    const sanitizedImages = images.map(image => ({
      id: image._id,
      imageId: image.imageId,
      prompt: image.prompt,
      imageUrl: image.imageUrl,
      size: image.size,
      model: image.model,
      stylePreset: image.stylePreset,
      negativePrompt: image.negativePrompt,
      cfgScale: image.cfgScale,
      steps: image.steps,
      seed: image.seed,
      samples: image.samples,
      coinsUsed: image.coinsUsed,
      createdAt: image.createdAt
    }));

    res.status(200).json({
      success: true,
      count: sanitizedImages.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: sanitizedImages
    });
  } catch (error) {
    console.error('Error fetching image history:', error);
    next(new ErrorResponse('Failed to fetch image history', 500));
  }
};

/**
 * @desc    Download a generated image (one-time download)
 * @route   GET /api/image/download/:imageId
 * @access  Private
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @param   {Function} next - Express next middleware function
 * @returns {Stream} Image file download
 */
exports.downloadImage = async (req, res, next) => {
  const session = await Image.startSession();
  session.startTransaction();
  
  try {
    // No user check, but we still verify the image exists and hasn't been downloaded
    const image = await Image.findOne({
      imageId: req.params.imageId
    }).session(session);

    if (!image) {
      await session.abortTransaction();
      session.endSession();
      return next(new ErrorResponse('Image not found', 404));
    }

    // Check if image has already been downloaded
    if (image.downloaded) {
      await session.abortTransaction();
      session.endSession();
      return next(new ErrorResponse('This image has already been downloaded and is no longer available', 410));
    }

    // Mark image as downloaded
    image.downloaded = true;
    await image.save({ session });
    
    // Define the uploads directory path (same as in saveImageToStorage)
    const uploadDir = path.join(__dirname, '../../public/uploads');
    const filePath = path.join(uploadDir, `${image.imageId}.png`);
    
    try {
      // Verify the file exists before trying to stream it
      await fs.promises.access(filePath, fs.constants.F_OK);
      
      // Set headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="${image.imageId}.png"`);
      res.setHeader('Content-Type', 'image/png');
      
      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      
      // When the stream ends, delete the file
      fileStream.on('end', async () => {
        try {
          // Delete the file after streaming
          await fs.promises.unlink(filePath);
          await session.commitTransaction();
          session.endSession();
        } catch (deleteError) {
          console.error('Error deleting image after download:', deleteError);
          await session.abortTransaction();
          session.endSession();
        }
      });
      
      // Handle stream errors
      fileStream.on('error', async (error) => {
        console.error('Error streaming image:', error);
        await session.abortTransaction();
        session.endSession();
        next(new ErrorResponse('Error streaming image', 500));
      });
      
      // Pipe the file to the response
      return fileStream.pipe(res);
      
    } catch (error) {
      if (error.code === 'ENOENT') {
        await session.abortTransaction();
        session.endSession();
        return next(new ErrorResponse('Image file not found', 404));
      }
      throw error; // Re-throw other errors
    }
  } catch (error) {
    await session.abortTransaction().catch(console.error);
    session.endSession().catch(console.error);
    
    console.error(`Error downloading image ${req.params.imageId}:`, error);
    next(new ErrorResponse('Failed to download image', 500));
  }
};

/**
 * @desc    Get a single generated image by ID
 * @route   GET /api/image/:id
 * @access  Private
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @param   {Function} next - Express next middleware function
 * @returns {Object} JSON response with the requested image metadata
 */
exports.getImage = async (req, res, next) => {
  try {
    const image = await Image.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!image) {
      return next(new ErrorResponse('Image not found', 404));
    }

    // Check if image has been downloaded
    if (image.downloaded) {
      return next(new ErrorResponse('This image has already been downloaded and is no longer available', 410));
    }

    const response = {
      success: true,
      data: {
        id: image._id,
        imageId: image.imageId,
        prompt: image.prompt,
        downloadUrl: `/api/image/download/${image.imageId}`,
        size: image.size,
        model: image.model,
        stylePreset: image.stylePreset,
        negativePrompt: image.negativePrompt,
        cfgScale: image.cfgScale,
        steps: image.steps,
        seed: image.seed,
        samples: image.samples,
        coinsUsed: image.coinsUsed,
        createdAt: image.createdAt,
        downloaded: image.downloaded
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(`Error fetching image ${req.params.id}:`, error);
    
    if (error.name === 'CastError') {
      return next(new ErrorResponse('Invalid image ID', 400));
    }
    
    next(new ErrorResponse('Failed to fetch image', 500));
  }
};

/**
 * @desc    Delete a generated image
 * @route   DELETE /api/image/:id
 * @access  Private
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @param   {Function} next - Express next middleware function
 * @returns {Object} JSON response indicating success or failure
 */
exports.deleteImage = async (req, res, next) => {
  const session = await Image.startSession();
  session.startTransaction();
  
  try {
    // Find the image first to get the imageId and Cloudinary public ID
    const image = await Image.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).session(session);

    if (!image) {
      await session.abortTransaction();
      session.endSession();
      return next(new ErrorResponse('Image not found', 404));
    }

    // Delete the image from Cloudinary if it exists
    if (image.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(image.cloudinaryPublicId);
      } catch (cloudinaryError) {
        console.error('Error deleting image from Cloudinary:', cloudinaryError);
        // Continue with database deletion even if Cloudinary deletion fails
      }
    }

    // Delete the image record from database
    await Image.deleteOne({ _id: req.params.id }).session(session);
    
    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Error deleting image:', error);
    
    if (error.name === 'CastError') {
      return next(new ErrorResponse('Invalid image ID', 400));
    }
    
    next(new ErrorResponse('Failed to delete image', 500));
  }
};

/**
 * Saves an image to the storage system
 * @param {string} base64Data - The base64 encoded image data
 * @param {string} imageId - Unique identifier for the image
 * @returns {Promise<string>} The URL or path to the saved image
 * @throws {Error} If the image cannot be saved
 */
async function saveImageToStorage(base64Data, imageId) {
  if (!base64Data) {
    throw new Error('No image data provided');
  }

  // In a production environment, you would upload to a cloud storage service
  // like AWS S3, Google Cloud Storage, Cloudinary, etc.
  // This is a simplified example that saves to the local filesystem
  
  // Ensure the uploads directory exists
  const uploadDir = path.join(__dirname, '../../public/uploads');
  
  try {
    console.log(`[DEBUG] Creating directory: ${uploadDir}`);
    // Create the directory if it doesn't exist (recursively)
    await fs.promises.mkdir(uploadDir, { recursive: true });
    
    // Create the full file path
    const fileName = `${imageId}.png`;
    const filePath = path.join(uploadDir, fileName);
    
    console.log(`[DEBUG] Saving image to: ${filePath}`);
    
    // Convert base64 to buffer and write to file
    const buffer = Buffer.from(base64Data, 'base64');
    await fs.promises.writeFile(filePath, buffer);
    
    // Verify the file was saved
    try {
      const stats = await fs.promises.stat(filePath);
      console.log(`[DEBUG] File saved successfully. Size: ${stats.size} bytes`);
    } catch (verifyError) {
      console.error('[ERROR] Failed to verify file was saved:', verifyError);
      throw new Error('Failed to verify image was saved to storage');
    }
    
    // Return the relative URL path
    return `/uploads/${fileName}`;
  } catch (error) {
    console.error('Error saving image to storage:', error);
    throw new Error(`Failed to save image: ${error.message}`);
  }
}

/**
 * Deletes an image from the storage system
 * @param {string} imageId - The unique identifier of the image to delete
 * @returns {Promise<void>}
 * @throws {Error} If the image cannot be deleted
 */
async function deleteImageFromStorage(imageId) {
  if (!imageId) {
    throw new Error('No image ID provided');
  }

  try {
    const filePath = path.join(__dirname, '../../public/uploads', `${imageId}.png`);
    
    // Check if file exists before attempting to delete
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      
      // File exists, so delete it
      await fs.promises.unlink(filePath);
      
      // Optional: Delete the directory if it's empty
      const dirPath = path.dirname(filePath);
      try {
        const files = await fs.promises.readdir(dirPath);
        if (files.length === 0) {
          await fs.promises.rmdir(dirPath);
        }
      } catch (dirError) {
        // It's okay if we can't delete the directory
        console.debug('Could not remove directory (may not be empty):', dirError.message);
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, which is fine for a delete operation
        return;
      }
      throw error; // Re-throw other errors
    }
  } catch (error) {
    console.error(`Error deleting image ${imageId}:`, error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}
