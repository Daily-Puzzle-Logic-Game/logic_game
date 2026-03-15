const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/google
router.post('/google', authController.googleLogin);

// POST /api/auth/truecaller
router.post('/truecaller', authController.truecallerLogin);

// POST /api/auth/signup
router.post('/signup', authController.emailSignup);

// POST /api/auth/login
router.post('/login', authController.emailLogin);

// POST /api/auth/guest
router.post('/guest', authController.guestLogin);

module.exports = router;
