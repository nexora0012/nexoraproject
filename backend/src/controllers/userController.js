const User = require('../models/User');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      '-password',
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.log('Get profile error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const {fullName, mobile} = req.body;

    const cleanName =
      typeof fullName === 'string'
        ? fullName.trim()
        : '';

    const cleanMobile =
      typeof mobile === 'string'
        ? mobile.trim()
        : '';

    if (!cleanName) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required',
      });
    }

    if (!/^[0-9]{10}$/.test(cleanMobile)) {
      return res.status(400).json({
        success: false,
        message:
          'Please enter a valid 10-digit mobile number',
      });
    }

    const existingMobileUser = await User.findOne({
      mobile: cleanMobile,
      _id: {$ne: req.user.id},
    });

    if (existingMobileUser) {
      return res.status(409).json({
        success: false,
        message:
          'This mobile number is already registered',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        fullName: cleanName,
        mobile: cleanMobile,
      },
      {
        new: true,
        runValidators: true,
      },
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.log('Update profile error:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          'This mobile number is already registered',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};