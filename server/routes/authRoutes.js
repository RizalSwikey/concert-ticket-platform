const express = require('express');
const router = express.Router();
const { register, login, demoLogin, getMe } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/demo-login', demoLogin);
router.get('/me', authMiddleware, getMe);

module.exports = router;
