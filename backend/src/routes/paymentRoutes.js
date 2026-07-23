const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getMyPaymentHistory,
} = require("../controllers/paymentController");

router.post(
  "/create-order",
  authMiddleware,
  createRazorpayOrder
);

router.post(
  "/verify",
  authMiddleware,
  verifyRazorpayPayment
);

router.get(
  "/history",
  authMiddleware,
  getMyPaymentHistory
);

module.exports = router;