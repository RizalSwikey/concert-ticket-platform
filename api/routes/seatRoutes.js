const express = require('express');
const router = express.Router();
const {
  lockSeats,
  unlockSeats,
  simulateConcurrency
} = require('../controllers/seatController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post('/lock', optionalAuth, lockSeats);
router.post('/unlock', optionalAuth, unlockSeats);
router.post('/simulate-concurrency', simulateConcurrency);

module.exports = router;
