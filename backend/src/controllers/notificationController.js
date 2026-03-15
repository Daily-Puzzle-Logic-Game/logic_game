const prisma = require('../config/prisma');

// Get all notifications for the user
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        res.status(200).json(notifications);
    } catch (error) {
        console.error('Get Notifications Error:', error);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const notification = await prisma.notification.updateMany({
            where: { id, userId },
            data: { read: true }
        });

        res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Mark As Read Error:', error);
        res.status(500).json({ message: 'Error updating notification' });
    }
};

// Mark all notifications for the user as read
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true }
        });
        res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark All As Read Error:', error);
        res.status(500).json({ message: 'Error updating notifications' });
    }
};

// Delete all notifications for the user
exports.deleteAllNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        await prisma.notification.deleteMany({
            where: { userId }
        });
        res.status(200).json({ message: 'All notifications deleted' });
    } catch (error) {
        console.error('Delete All Notifications Error:', error);
        res.status(500).json({ message: 'Error deleting notifications' });
    }
};

// Internal helper to create a notification
exports.createInternalNotification = async (userId, title, message, type) => {
    try {
        await prisma.notification.create({
            data: { userId, title, message, type }
        });
    } catch (error) {
        console.error('Create Internal Notification Error:', error);
    }
};
