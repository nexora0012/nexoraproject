

const mongoose = require('mongoose');

const usdtPaymentSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      default: null,
    },

    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UsdtPayment', usdtPaymentSchema);