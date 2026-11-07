const express = require('express');
const router = express.Router();
const {
  getConcerts,
  getConcertById,
  getConcertSeats
} = require('../controllers/concertController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/', getConcerts);
router.get('/:id', getConcertById);
router.get('/:id/seats', optionalAuth, getConcertSeats);

module.exports = router;
