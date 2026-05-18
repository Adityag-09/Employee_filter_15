const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getRecommendation } = require('../controllers/aiController');

// AI recommendation endpoint — protected
router.post('/recommend', protect, getRecommendation);

module.exports = router;
