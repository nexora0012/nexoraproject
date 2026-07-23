const express = require('express');

const router = express.Router();

const adminMiddleware = require('../middleware/adminMiddleware');

const {
  getPlans,
  getActivePlans,
  getPlan,
  addPlan,
  updatePlan,
  deletePlan,
} = require('../controllers/planController');

// Public/mobile active plans
// Keep this route before "/:id"
router.get('/active', getActivePlans);

// Admin and general plan listing
router.get('/', getPlans);

router.get('/:id', getPlan);

router.post('/', adminMiddleware, addPlan);

router.put('/:id', adminMiddleware, updatePlan);

router.delete('/:id', adminMiddleware, deletePlan);

module.exports = router;