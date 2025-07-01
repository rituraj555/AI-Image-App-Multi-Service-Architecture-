const User = require('../models/User');
const CoinTransaction = require('../models/CoinTransaction');
const { ErrorResponse } = require('../utils/errorResponse');

// @desc    Buy coins
// @route   POST /api/coin/buy
// @access  Private
exports.buyCoins = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      return next(new ErrorResponse('Please provide a valid amount', 400));
    }

    // Update user's coin balance
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { coins: amount } },
      { new: true, runValidators: true }
    );

    // Create transaction record
    await CoinTransaction.create({
      userId,
      type: 'buy',
      amount,
      details: `Purchased ${amount} coins`
    });

    res.status(200).json({
      success: true,
      data: {
        coins: user.coins + amount,
        transaction: {
          type: 'buy',
          amount,
          newBalance: user.coins + amount
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Earn coins from ad view
// @route   POST /api/coin/earn
// @access  Private
exports.earnCoins = async (req, res, next) => {
  try {
    const { amount = 1 } = req.body; // Default 1 coin per ad view
    const userId = req.user.id;

    // Update user's coin balance
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { coins: amount } },
      { new: true, runValidators: true }
    );

    // Create transaction record
    await CoinTransaction.create({
      userId,
      type: 'ad',
      amount,
      details: `Earned ${amount} coins from ad view`
    });

    res.status(200).json({
      success: true,
      data: {
        coins: user.coins + amount,
        transaction: {
          type: 'ad',
          amount,
          newBalance: user.coins + amount
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deduct coins
// @route   POST /api/coin/deduct
// @access  Private
exports.deductCoins = async (req, res, next) => {
  try {
    const { amount, reason = 'Image generation' } = req.body;
    const userId = req.user.id;

    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      return next(new ErrorResponse('Please provide a valid amount', 400));
    }

    // Check if user has enough coins
    const user = await User.findById(userId);
    if (user.coins < amount) {
      return next(new ErrorResponse('Insufficient coins', 400));
    }

    // Deduct coins
    user.coins -= amount;
    await user.save();

    // Create transaction record
    await CoinTransaction.create({
      userId,
      type: 'deduct',
      amount: -amount,
      details: `Deducted ${amount} coins for ${reason}`
    });

    res.status(200).json({
      success: true,
      data: {
        coins: user.coins,
        transaction: {
          type: 'deduct',
          amount: -amount,
          newBalance: user.coins
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's coin balance
// @route   GET /api/coin/balance
// @access  Private
exports.getBalance = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('coins');
    
    res.status(200).json({
      success: true,
      data: {
        coins: user.coins
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's transaction history
// @route   GET /api/coin/transactions
// @access  Private
exports.getTransactionHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const transactions = await CoinTransaction.find({ userId: req.user.id })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await CoinTransaction.countDocuments({ userId: req.user.id });

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};
