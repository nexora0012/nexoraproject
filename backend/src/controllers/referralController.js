const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');
const ReferralSettings = require('../models/ReferralSettings');
const generateReferralCode = require('../utils/generateReferralCode');

// User: my referral code, earnings, and list of people I referred
const getMySummary = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('referralCode');

    if (!user.referralCode) {
      user.referralCode = await generateReferralCode();
      await user.save();
    }

    const referredUsers = await User.find({ referredBy: req.user.id })
      .select('fullName createdAt referralRewardGiven')
      .sort({ createdAt: -1 });

    const earnings = await WalletTransaction.aggregate([
      {
        $match: {
          user: user._id,
          category: 'ReferralBonus',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      referralCode: user.referralCode,
      totalEarned: earnings.length > 0 ? earnings[0].total : 0,
      referredUsers: referredUsers.map((u) => ({
        fullName: u.fullName,
        joinedAt: u.createdAt,
        status: u.referralRewardGiven ? 'Rewarded' : 'Pending',
      })),
    });
  } catch (error) {
    console.error('Get referral summary error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Admin: get referral settings
const getSettings = async (req, res) => {
  try {
    let settings = await ReferralSettings.findOne();

    if (!settings) {
      settings = await ReferralSettings.create({});
    }

    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error('Get referral settings error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Admin: update referral settings
const updateSettings = async (req, res) => {
  try {
    const { enabled, rewardType, rewardValue, minPurchaseAmount, newUserBonus } = req.body;

    let settings = await ReferralSettings.findOne();

    if (!settings) {
      settings = new ReferralSettings();
    }

    if (enabled !== undefined) settings.enabled = enabled;
    if (rewardType !== undefined) settings.rewardType = rewardType;
    if (rewardValue !== undefined) settings.rewardValue = rewardValue;
    if (minPurchaseAmount !== undefined) settings.minPurchaseAmount = minPurchaseAmount;
    if (newUserBonus !== undefined) settings.newUserBonus = newUserBonus;

    await settings.save();

    return res.status(200).json({
      success: true,
      message: 'Referral settings updated successfully',
      data: settings,
    });
  } catch (error) {
    console.error('Update referral settings error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Admin: list all referrals across the platform
const getAllReferrals = async (req, res) => {
  try {
    const referredUsers = await User.find({ referredBy: { $ne: null } })
      .populate('referredBy', 'fullName email mobile')
      .select('fullName email mobile createdAt referralRewardGiven referredBy')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, referrals: referredUsers });
  } catch (error) {
    console.error('Get all referrals error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = { getMySummary, getSettings, updateSettings, getAllReferrals };