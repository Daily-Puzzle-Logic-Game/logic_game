const express = require('express');
const { syncScore, getLeaderboard } = require('../controllers/scoreController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/sync', protect, syncScore);
router.get('/leaderboard', getLeaderboard);

module.exports = router;
