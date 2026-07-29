const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const { sendOtp, checkOtp } = require('../utils/twilioClient');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/;

const generateReferralCode = require('../utils/generateReferralCode');
const ReferralSettings = require('../models/ReferralSettings');

// Step 1: Register — validates + sends OTP via Twilio (if enabled), does NOT fully activate account
const register = async (req, res) => {
  try {
    const { fullName, email, mobile, password, referralCode } = req.body;

    if (!fullName || !email || !mobile || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanMobile = mobile.trim();

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    }

    if (!MOBILE_REGEX.test(cleanMobile)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number' });
    }

    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { mobile: cleanMobile }],
    });

    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email or mobile already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otpEnabled = process.env.OTP_VERIFICATION_ENABLED === 'true';
    let user;

    if (existingUser && !existingUser.isVerified) {
      existingUser.fullName = fullName;
      existingUser.email = cleanEmail;
      existingUser.mobile = cleanMobile;
      existingUser.password = hashedPassword;
      existingUser.isVerified = !otpEnabled;
      user = await existingUser.save();
    } else {
      let referredBy = null;

      if (referralCode) {
        const referrer = await User.findOne({
          referralCode: referralCode.trim().toUpperCase(),
        });

        if (referrer) {
          referredBy = referrer._id;
        }
      }

      const newReferralCode = await generateReferralCode();

      user = await User.create({
        fullName,
        email: cleanEmail,
        mobile: cleanMobile,
        password: hashedPassword,
        isVerified: !otpEnabled,
        referralCode: newReferralCode,
        referredBy,
      });

      if (referredBy && !otpEnabled) {
        const settings = await ReferralSettings.findOne();

        if (settings?.enabled && settings.newUserBonus > 0) {
          user.walletBalance = Number(user.walletBalance || 0) + settings.newUserBonus;
          await user.save();
        }
      }
    }

    if (otpEnabled) {
      await sendOtp(cleanMobile);

      return res.status(201).json({
        success: true,
        message: 'OTP sent to your mobile number. Please verify to complete registration.',
        mobile: cleanMobile,
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Step 2: Verify OTP -> activates the account and logs in (only used when OTP is enabled)
const verifyRegistrationOtp = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({ success: false, message: 'Mobile number and OTP are required' });
    }

    const cleanMobile = mobile.trim();
    const user = await User.findOne({ mobile: cleanMobile });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No pending verification for this number' });
    }

    const result = await checkOtp(cleanMobile, otp);

    if (result.status !== 'approved') {
      return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      success: true,
      message: 'Account verified successfully',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Resend OTP for an unverified registration
const resendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;
    const user = await User.findOne({ mobile: mobile?.trim() });

    if (!user || user.isVerified) {
      return res.status(400).json({ success: false, message: 'No pending verification for this number' });
    }

    await sendOtp(user.mobile);

    return res.status(200).json({ success: true, message: 'OTP resent' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Login — blocks unverified accounts (irrelevant while OTP is paused, since new users are auto-verified)
const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    email = email.trim().toLowerCase();
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your mobile number before logging in',
        mobile: user.mobile,
      });
    }

    const passwordMatched = await bcrypt.compare(password, user.password);

    if (!passwordMatched) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must contain at least 6 characters' });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ success: false, message: 'New password must be different from current password' });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const passwordMatched = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatched) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Step 1: request password reset — sends OTP to the account's mobile
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If this email is registered, an OTP has been sent to the linked mobile number.',
      });
    }

    await sendOtp(user.mobile);

    const maskedMobile = user.mobile.replace(/(\d{2})\d{6}(\d{2})/, '$1XXXXXX$2');

    return res.status(200).json({
      success: true,
      message: `OTP sent to ${maskedMobile}`,
      mobile: user.mobile,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Step 2: verify OTP + set new password
const resetPassword = async (req, res) => {
  try {
    const { mobile, otp, newPassword } = req.body;

    if (!mobile || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mobile, OTP, and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must contain at least 6 characters',
      });
    }

    const user = await User.findOne({ mobile: mobile.trim() });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const result = await checkOtp(mobile.trim(), otp);

    if (result.status !== 'approved') {
      return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  register,
  verifyRegistrationOtp,
  resendOtp,
  login,
  changePassword,
  forgotPassword,
  resetPassword,
};