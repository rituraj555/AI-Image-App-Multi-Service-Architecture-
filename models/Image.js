const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  prompt: {
    type: String,
    required: [true, 'Prompt is required'],
    trim: true
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required']
  },
  imageId: {
    type: String,
    required: [true, 'Image ID is required']
  },
  cloudinaryPublicId: {
    type: String,
    required: [true, 'Cloudinary public ID is required']
  },
  coinsUsed: {
    type: Number,
    required: true,
    default: 10,
    min: 0
  },
  size: {
    width: {
      type: Number,
      default: 1024
    },
    height: {
      type: Number,
      default: 1024
    }
  },
  model: {
    type: String,
    default: 'stable-diffusion-xl-1024-v1-0'
  },
  style: {
    type: String,
    enum: [
      'realistic', 'anime', 'digital-art', 'comic', 'fantasy-art',
      'line-art', 'analog-film', 'neon-punk', 'isometric', 'low-poly',
      'origami', 'modeling-compound', 'cinematic', '3d-model', 'pixel-art',
      'tile-texture', 'none'
    ],
    default: 'realistic',
    required: true
  },
  downloaded: {
    type: Boolean,
    default: false,
    required: true
  },
  stylePreset: {
    type: String,
    enum: [
      '3d-model',
      'anime',
      'cinematic',
      'comic-book',
      'digital-art',
      'enhance',
      'fantasy-art',
      'isometric',
      'line-art',
      'low-poly',
      'modeling-compound',
      'neon-punk',
      'origami',
      'photographic',
      'pixel-art',
      'tile-texture'
    ],
    default: 'digital-art'
  },
  negativePrompt: {
    type: String,
    default: ''
  },
  cfgScale: {
    type: Number,
    min: 0,
    max: 35,
    default: 7
  },
  steps: {
    type: Number,
    min: 10,
    max: 150,
    default: 30
  },
  seed: {
    type: Number,
    default: 0
  },
  samples: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likeCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster querying
imageSchema.index({ userId: 1, createdAt: -1 });

// Virtual for image URL
imageSchema.virtual('url').get(function() {
  return this.imageUrl;
});

// Update like count virtual
imageSchema.virtual('likesCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Pre-save hook to update likeCount
imageSchema.pre('save', function(next) {
  if (this.isModified('likes')) {
    this.likeCount = this.likes.length;
  }
  next();
});

// Static method to get total images count
imageSchema.statics.getTotalImages = async function(userId) {
  const count = await this.countDocuments(userId ? { userId } : {});
  return count;
};

// Static method to get total coins spent
imageSchema.statics.getTotalCoinsSpent = async function(userId) {
  const result = await this.aggregate([
    {
      $match: { userId: mongoose.Types.ObjectId(userId) }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$coinsUsed' }
      }
    }
  ]);

  return result.length > 0 ? result[0].total : 0;
};

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;
