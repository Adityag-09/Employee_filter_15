const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { signup, login, getProfile } = require('../controllers/authController');

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected route
router.get('/profile', protect, getProfile);

module.exports = router;
