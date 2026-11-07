const express = require('express');
const router = express.Router();
const { seedDatabase } = require('../controllers/seedController');

router.post('/', seedDatabase);
router.get('/run', seedDatabase); // Convenient GET hook for browser/quick testing

module.exports = router;
