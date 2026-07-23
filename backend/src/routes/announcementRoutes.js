const express = require('express');

const router = express.Router();

const adminMiddleware = require('../middleware/adminMiddleware');

const {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementController');

// Public
router.get('/', getAnnouncements);

// Admin
router.post('/', adminMiddleware, createAnnouncement);

router.put('/:id', adminMiddleware, updateAnnouncement);

router.delete('/:id', adminMiddleware, deleteAnnouncement);

module.exports = router;