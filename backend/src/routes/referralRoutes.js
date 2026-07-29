const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const {
  getMySummary,
  getSettings,
  updateSettings,
  getAllReferrals,
} = require('../controllers/referralController');

// User
router.get('/my-summary', authMiddleware, getMySummary);

// Admin
router.get('/settings', adminMiddleware, getSettings);
router.put('/settings', adminMiddleware, updateSettings);
router.get('/admin/all', adminMiddleware, getAllReferrals);

module.exports = router;