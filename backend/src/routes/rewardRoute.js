const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/rewardController');
const { protect } = require('../middleware/authMiddleware');

// Get Reward Status (Streak & Claimable status)
router.get('/status', protect, rewardController.getRewardStatus);

// Claim Daily Reward
router.post('/claim', protect, rewardController.claimDailyReward);

module.exports = router;
