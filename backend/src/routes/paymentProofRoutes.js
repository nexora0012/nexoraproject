const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const uploadProof = require('../middleware/uploadProof');

const {
  submitProof,
  getMyProofs,
  deleteProof,
  getPendingProofCount,
  getProofs,
  updateProofStatus,
} = require('../controllers/paymentProofController');

// User routes (auth required)
router.post('/', authMiddleware, uploadProof.single('screenshot'), submitProof);
router.get('/my-proofs', authMiddleware, getMyProofs);
router.get('/pending-count', authMiddleware, getPendingProofCount);
router.delete('/:id', authMiddleware, deleteProof);

// Admin views/manages proofs
router.get('/admin', adminMiddleware, getProofs);
router.put('/admin/:id', adminMiddleware, updateProofStatus);

module.exports = router;