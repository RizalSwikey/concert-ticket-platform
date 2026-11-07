const express = require('express');
const router = express.Router();
const { demoLogin, getMe } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/demo-login', demoLogin);
router.get('/me', authMiddleware, getMe);

module.exports = router;
