const { ErrorResponse } = require('../utils/errorResponse');
const User = require('../models/User');

// @desc    Get current user's profile
// @route   GET /api/user/profile
// @access  Private
exports.getUserProfile = async (req, res, next) => {
  try {
    // Find user by ID from JWT token (attached by auth middleware)
    const user = await User.findById(req.user.id).select(
      'email coins isSubscribed subscriptionExpiry subscriptionPlan createdAt'
    );

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        email: user.email,
        coins: user.coins,
        isSubscribed: user.isSubscribed,
        subscriptionExpiry: user.subscriptionExpiry,
        subscriptionPlan: user.subscriptionPlan,
        joinDate: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
exports.updateUserProfile = async (req, res, next) => {
  try {
    // Only allow certain fields to be updated
    const { email } = req.body;
    
    const updateData = {};
    
    // Only update email if it's provided and different
    if (email) {
      updateData.email = email;
    }
    
    // Find and update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('email coins isSubscribed subscriptionExpiry subscriptionPlan createdAt');

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        email: user.email,
        coins: user.coins,
        isSubscribed: user.isSubscribed,
        subscriptionExpiry: user.subscriptionExpiry,
        subscriptionPlan: user.subscriptionPlan,
        joinDate: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};
