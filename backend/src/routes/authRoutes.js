const express = require('express');

const router = express.Router();

const {
  register,
  login,
  changePassword,
  verifyRegistrationOtp,
  resendOtp,forgotPassword, resetPassword,
} = require('../controllers/authController');

const authMiddleware = require(
  '../middleware/authMiddleware',
);

router.post('/register', register);

router.post('/login', login);

router.put(
  '/change-password',
  authMiddleware,
  changePassword,
);
router.post('/verify-registration-otp', verifyRegistrationOtp);
router.post('/resend-otp', resendOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
module.exports = router;