const express = require('express');
const { getNotifications, markAsRead, markAllAsRead, deleteAllNotifications } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getNotifications);
router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);
router.delete('/', protect, deleteAllNotifications);

module.exports = router;
