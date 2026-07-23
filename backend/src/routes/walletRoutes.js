const express = require('express');

const router = express.Router();

const authMiddleware = require(
  '../middleware/authMiddleware',
);

const adminMiddleware = require(
  '../middleware/adminMiddleware',
);

const {
  getWallet,
  creditWallet,
  debitWallet,
  getMyWalletSummary,
  getMyTransactions,
} = require(
  '../controllers/adminWalletController',
);

// Mobile logged-in user routes
router.get(
  '/summary',
  authMiddleware,
  getMyWalletSummary,
);

router.get(
  '/transactions',
  authMiddleware,
  getMyTransactions,
);

// Admin routes
router.post(
  '/credit/:id',
  adminMiddleware,
  creditWallet,
);

router.post(
  '/debit/:id',
  adminMiddleware,
  debitWallet,
);

router.get(
  '/:id',
  adminMiddleware,
  getWallet,
);

module.exports = router;