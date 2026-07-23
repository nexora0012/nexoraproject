const Announcement = require('../models/Announcement');

// Get all announcements
const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({
      isPinned: -1,
      createdAt: -1,
    });

    res.json({
      success: true,
      announcements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

// Create announcement
const createAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.create(req.body);

    res.status(201).json({
      success: true,
      announcement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

// Update announcement
const updateAnnouncement = async (req, res) => {
  try {
    const announcement =
      await Announcement.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );

    res.json({
      success: true,
      announcement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

// Delete announcement
const deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(
      req.params.id
    );

    res.json({
      success: true,
      message: 'Announcement Deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

module.exports = {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};