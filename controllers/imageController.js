const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { ErrorResponse } = require('../utils/errorResponse');
const Image = require('../models/Image');
const User = require('../models/User');

// Constants
const COST_PER_IMAGE = 10; // Coins deducted per image generation
const STABILITY_API_URL = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image';

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

    // Check user's coin balance
    const user = await User.findById(userId).session(session);
    if (user.coins < COST_PER_IMAGE) {
      return next(new ErrorResponse('Insufficient coins', 400));
    }

    // Call Stability AI API
    const response = await axios.post(
      STABILITY_API_URL,
      {
        text_prompts: [
          {
            text: prompt,
            weight: 1
          },
          {
            text: negativePrompt || 'blurry, low quality, distorted, deformed, disfigured',
            weight: -1
          }
        ],
        cfg_scale: cfgScale || 7,
        height: height || 1024,
        width: width || 1024,
        samples: samples || 1,
        steps: steps || 30,
        style_preset: stylePreset || 'digital-art',
        seed: seed || 0
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`
        },
        responseType: 'json'
      }
    );

    if (!response.data.artifacts || !response.data.artifacts.length) {
      throw new Error('No image was generated');
    }

    // Deduct coins from user
    user.coins -= COST_PER_IMAGE;
    await user.save({ session });

    // Process the generated images
    const imageArtifacts = [];
    
    for (const artifact of response.data.artifacts) {
      const imageId = uuidv4();
      
      // Save image to storage (optional, if you still want to store it)
      const imageUrl = await saveImageToStorage(artifact.base64, imageId);
      
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

    res.status(201).json({
      success: true,
      data: {
        images: imageArtifacts,
        coinsUsed: COST_PER_IMAGE * imageArtifacts.length,
        remainingCoins: user.coins
      }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Image generation error:', error);
    next(new ErrorResponse('Failed to generate image', 500));
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
