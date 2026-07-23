const express = require('express');

const adminMiddleware = require(
  '../middleware/adminMiddleware',
);

const {
  getReturnSummary,
  getPendingReturns,
  processSingleReturn,
  retryFailedReturn,
} = require(
  '../controllers/adminReturnController',
);

const router = express.Router();

router.get(
  '/summary',
  adminMiddleware,
  getReturnSummary,
);

router.get(
  '/',
  adminMiddleware,
  getPendingReturns,
);

router.post(
  '/:subscriptionId/process',
  adminMiddleware,
  processSingleReturn,
);

router.post(
  '/:subscriptionId/retry',
  adminMiddleware,
  retryFailedReturn,
);

module.exports = router;