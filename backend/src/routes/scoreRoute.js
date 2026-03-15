const express = require('express');
const { syncScore, getLeaderboard, syncBatch } = require('../controllers/scoreController');
const { protect, maybeProtect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/sync', protect, syncScore);
router.post('/sync-batch', maybeProtect, syncBatch);
router.get('/leaderboard', getLeaderboard);

module.exports = router;
