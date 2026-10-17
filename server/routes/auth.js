const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Public auth endpoints
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected student profile endpoint
router.get('/me', authenticateToken, authController.getCurrentUser);

module.exports = router;
