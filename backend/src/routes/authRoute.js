const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/google
router.post('/google', authController.googleLogin);

// POST /api/auth/truecaller  (legacy payload-based flow)
router.post('/truecaller', authController.truecallerLogin);

// GET /api/auth/truecaller/callback  - Truecaller Web SDK redirect target
router.get('/truecaller/callback', authController.truecallerCallback);

// GET /api/auth/truecaller/session/:requestId  - Frontend polls for completed session
router.get('/truecaller/session/:requestId', authController.truecallerSession);

module.exports = router;
