const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const uploadProof = require('../middleware/uploadProof');

const {
  submitProof,
  getProofs,
  updateProofStatus,
} = require('../controllers/paymentProofController');

// User submits proof (needs to be logged in)
router.post('/', authMiddleware, uploadProof.single('screenshot'), submitProof);

// Admin views/manages proofs
router.get('/admin', adminMiddleware, getProofs);
router.put('/admin/:id', adminMiddleware, updateProofStatus);

module.exports = router;