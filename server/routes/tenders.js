const express = require('express');
const {
  createTender,
  getTenders,
  getTender,
  updateTender,
  concludeTender
} = require('../controllers/tenderController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getTenders)
  .post(protect, authorize('tenderer', 'admin'), createTender);

router.route('/:id')
  .get(getTender)
  .put(protect, updateTender);

router.route('/:id/conclude')
  .post(protect, concludeTender);

module.exports = router;
