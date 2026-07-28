const mongoose = require('mongoose');

const paymentProofSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    screenshot: {
      type: String,
      required: true,
    },

    accountDetails: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PaymentProof', paymentProofSchema);