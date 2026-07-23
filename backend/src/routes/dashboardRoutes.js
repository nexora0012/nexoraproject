const express = require('express');

const authMiddleware = require('../middleware/authMiddleware');

const {
  getUserDashboard,
} = require('../controllers/userDashboardController');

const router = express.Router();

/*
 * GET /api/dashboard
 * Logged-in user dashboard
 */
router.get(
  '/',
  authMiddleware,
  getUserDashboard,
);

module.exports = router;