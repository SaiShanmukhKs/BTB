const express = require('express');
const {
  submitBid,
  getBidsForTender,
  getBid,
  updateBid,
  invalidateBid
} = require('../controllers/bidController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post(protect, authorize('bidder', 'admin'), submitBid);

router.route('/tender/:tenderId')
  .get(protect, getBidsForTender);

router.route('/:id')
  .get(protect, getBid)
  .put(protect, updateBid);

router.route('/:id/invalidate')
  .post(protect, invalidateBid);

module.exports = router;
