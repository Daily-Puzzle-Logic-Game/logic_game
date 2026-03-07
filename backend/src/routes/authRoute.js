const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/google
router.post('/google', authController.googleLogin);

// POST /api/auth/truecaller
router.post('/truecaller', authController.truecallerLogin);

module.exports = router;
