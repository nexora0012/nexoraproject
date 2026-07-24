
const express = require('express');
const router = express.Router();

const adminMiddleware = require('../middleware/adminMiddleware');
const uploadUsdt = require('../middleware/uploadUsdt');

const {
  updateUsdtPayment,
  getUsdtPayment,
} = require('../controllers/usdtPaymentController');

router.get('/', getUsdtPayment);
router.put('/', adminMiddleware, uploadUsdt.single('image'), updateUsdtPayment);

module.exports = router;
