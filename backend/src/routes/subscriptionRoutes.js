const express = require('express');

const router = express.Router();

const adminMiddleware = require('../middleware/adminMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

const {
  getSubscriptions,
  subscribePlan,
  getUserSubscription,
  getSubscriptionHistory,
  renewSubscription,
  getAllSubscriptions,
} = require('../controllers/subscriptionController');

// Admin routes
router.get('/', adminMiddleware, getSubscriptions);
router.get('/all', adminMiddleware, getAllSubscriptions);

// Logged-in mobile user routes
router.post('/', authMiddleware, subscribePlan);

router.get(
  '/my-subscription',
  authMiddleware,
  getUserSubscription,
);

router.get(
  '/my-history',
  authMiddleware,
  getSubscriptionHistory,
);

router.put(
  '/renew/:subscriptionId',
  authMiddleware,
  renewSubscription,
);

module.exports = router;