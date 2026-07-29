const mongoose = require('mongoose');

const referralSettingsSchema = new mongoose.Schema(
  {
    enabled: {
      type: Boolean,
      default: true,
    },

    rewardType: {
      type: String,
      enum: ['flat', 'percentage'],
      default: 'flat',
    },

    rewardValue: {
      type: Number,
      default: 50,
    },

    minPurchaseAmount: {
      type: Number,
      default: 0,
    },

    newUserBonus: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ReferralSettings', referralSettingsSchema);