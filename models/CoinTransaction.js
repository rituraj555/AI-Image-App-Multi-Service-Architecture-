const mongoose = require('mongoose');

const transactionTypes = ['buy', 'ad', 'deduct'];

const coinTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: transactionTypes,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  details: {
    type: String,
    trim: true
  }
});

// Index for faster querying of user transactions
coinTransactionSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('CoinTransaction', coinTransactionSchema);
