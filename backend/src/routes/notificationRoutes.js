const express = require("express");

const router = express.Router();

const {
  getNotifications,
  createNotification,
  markAsRead,
} = require("../controllers/notificationController");



router.post("/", createNotification);

router.get("/:userId", getNotifications);

router.put("/read/:id", markAsRead);

module.exports = router;