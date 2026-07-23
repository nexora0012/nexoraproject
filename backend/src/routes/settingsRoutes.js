const express = require('express');

const router = express.Router();

const adminMiddleware = require('../middleware/adminMiddleware');

const {
  getSettings,
  updateSettings,
} = require('../controllers/settingsController');

router.get('/', getSettings);

router.put(
  '/',
  adminMiddleware,
  updateSettings
);

module.exports = router;