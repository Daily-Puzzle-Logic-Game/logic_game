const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const journeyController = require('../controllers/journeyController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/user/profile
router.get('/profile', protect, userController.getUserProfile);

// GET /api/user/dashboard
router.get('/dashboard', protect, userController.getDashboard);

// GET /api/user/stats (Public)
router.get('/stats', userController.getGlobalStats);

// POST /api/user/achievement
router.post('/achievement', protect, userController.earnAchievement);

// POST /api/user/journey/complete
router.post('/journey/complete', protect, journeyController.completeJourneyLevel);

// POST /api/user/buy-hint
router.post('/buy-hint', protect, userController.buyHint);

module.exports = router;
