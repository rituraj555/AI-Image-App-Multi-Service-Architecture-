const { ErrorResponse } = require('../utils/errorResponse');
const User = require('../models/User');
const { verifySubscription, isSubscriptionActive } = require('../utils/googlePlayClient');

// @desc    Verify Google Play subscription
// @route   POST /api/subscription/verify
// @access  Private
exports.verifySubscription = async (req, res, next) => {
  try {
    const { purchaseToken, productId, packageName } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!purchaseToken || !productId || !packageName) {
      return next(new ErrorResponse('Missing required fields', 400));
    }

    // Verify subscription with Google Play
    const subscription = await verifySubscription(packageName, productId, purchaseToken);
    
    if (!subscription.valid) {
      return next(new ErrorResponse('Invalid subscription', 400));
    }

    // Check if subscription is active
    const active = isSubscriptionActive(subscription);
    
    // Calculate expiration date (convert from milliseconds to Date)
    const expiryDate = subscription.expiryTimeMillis 
      ? new Date(parseInt(subscription.expiryTimeMillis))
      : null;

    // Determine subscription plan based on productId
    let subscriptionPlan = 'monthly';
    if (productId.includes('yearly')) {
      subscriptionPlan = 'yearly';
    } else if (productId.includes('lifetime')) {
      subscriptionPlan = 'lifetime';
    }

    // Update user's subscription status
    const updateData = {
      isSubscribed: active,
      subscriptionExpiry: expiryDate,
      subscriptionPlan: active ? subscriptionPlan : null,
      lastSubscriptionCheck: new Date(),
      googlePlayOrderId: subscription.orderId || null
    };

    // If subscription is not active, reset subscription plan
    if (!active) {
      updateData.subscriptionPlan = null;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        isSubscribed: user.isSubscribed,
        subscriptionExpiry: user.subscriptionExpiry,
        subscriptionPlan: user.subscriptionPlan,
        lastSubscriptionCheck: user.lastSubscriptionCheck
      }
    });

  } catch (error) {
    console.error('Subscription verification error:', error);
    next(error);
  }
};

// @desc    Get current user's subscription status
// @route   GET /api/subscription/status
// @access  Private
exports.getSubscriptionStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('isSubscribed subscriptionExpiry subscriptionPlan lastSubscriptionCheck');
    
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        isSubscribed: user.isSubscribed,
        subscriptionExpiry: user.subscriptionExpiry,
        subscriptionPlan: user.subscriptionPlan,
        lastSubscriptionCheck: user.lastSubscriptionCheck
      }
    });
  } catch (error) {
    next(error);
  }
};
