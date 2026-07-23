const Notification = require("../models/Notification");

const getNotifications = async (req, res) => {
  try {

    const notifications =
      await Notification.find({
        user: req.params.userId,
      }).sort({
        createdAt: -1,
      });

    res.json({
      success: true,
      notifications,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};
const createNotification = async (req, res) => {
  try {

    const {
      user,
      title,
      message,
      type,
    } = req.body;

    const notification =
      await Notification.create({
        user,
        title,
        message,
        type,
      });

    res.status(201).json({
      success: true,
      notification,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};
const markAsRead = async (req, res) => {
  try {

    const notification =
      await Notification.findByIdAndUpdate(
        req.params.id,
        {
          isRead: true,
        },
        {
          new: true,
        }
      );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      notification,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};

module.exports = {
  getNotifications,
  createNotification,
  markAsRead,
};