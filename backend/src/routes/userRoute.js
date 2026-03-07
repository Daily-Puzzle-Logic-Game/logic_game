const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/user/profile
router.get('/profile', protect, userController.getUserProfile);

module.exports = router;
