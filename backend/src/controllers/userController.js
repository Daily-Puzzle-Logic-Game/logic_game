const prisma = require('../config/prisma');

const { createInternalNotification } = require('./notificationController');

/**
 * POST /api/user/achievement
 * Allows frontend to report an earned achievement (Milestone 5, etc).
 */
exports.earnAchievement = async (req, res) => {
    try {
        const { badgeType, title, message } = req.body;
        const userId = req.user.id;

        const hasAc = await prisma.achievement.findUnique({
            where: { userId_badgeType: { userId, badgeType } }
        });

        if (!hasAc) {
            const achievement = await prisma.achievement.create({
                data: { userId, badgeType }
            });
            await createInternalNotification(userId, title || 'Achievement Unlocked', message || `You earned the ${badgeType} badge!`, 'ACHIEVEMENT');
            return res.status(201).json({ achievement, notified: true });
        }

        res.status(200).json({ message: 'Achievement already recorded' });
    } catch (error) {
        console.error('Earn Achievement Error:', error);
        res.status(500).json({ message: 'Error recording achievement' });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: { stats: true, achievements: true }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Profile Fetch Error:', error);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
};

/**
 * GET /api/user/dashboard
 * Consolidated endpoint for cloud DB migration.
 * Returns profile, heatmap activity, and today's puzzle state.
 */
exports.getDashboard = async (req, res) => {
    try {
        const userId = req.user.id;
        const todayStr = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0];

        // Fetch User and Stats
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { stats: true, achievements: true }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch 365 days of activity for the heatmap
        const activity = await prisma.dailyScore.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
            take: 365,
            select: {
                date: true,
                score: true,
                timeTaken: true,
                puzzleId: true
            }
        });


        // Check if today is completed
        const todayProgress = activity.find(a => a.date === todayStr);

        res.status(200).json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                picture: user.picture,
                streakCount: user.streakCount,
                totalPoints: user.totalPoints,
                journeyLevel: user.journeyLevel || 1,
                lastPlayed: user.lastPlayed,
                // hintsRemaining: 3 // Resets daily, not tracked in DB atm
            },
            stats: user.stats,
            achievements: user.achievements.map(a => ({
                id: a.badgeType,
                name: a.badgeType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                icon: a.badgeType,
                earnedAt: a.earnedAt
            })),
            activity: activity.map(a => ({
                date: a.date,
                score: a.score,
                timeTaken: a.timeTaken,
                solved: true,
                intensity: a.score > 100 ? 4 : (a.score > 50 ? 3 : (a.score > 20 ? 2 : 1))
            })),
            todayCompleted: !!todayProgress,
            todayScore: todayProgress?.score || 0
        });
    } catch (error) {
        console.error('Dashboard Fetch Error:', error);
        res.status(500).json({ message: 'Server error fetching dashboard data' });
    }
};
/**
 * GET /api/user/stats
 * Returns global platform stats (Total Users, Total Solves).
 */
exports.getGlobalStats = async (req, res) => {
    try {
        const [totalUsers, totalSolves] = await Promise.all([
            prisma.user.count(),
            prisma.dailyScore.count()
        ]);

        res.status(200).json({
            totalUsers,
            totalSolves,
            systemStatus: 'ONLINE',
            latency: '2ms'
        });
    } catch (error) {
        console.error('Global Stats Error:', error);
        res.status(500).json({ message: 'Error fetching global stats' });
    }
};

/**
 * POST /api/user/buy-hint
 * Deducts 500 points for a hint.
 */
exports.buyHint = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const HINT_COST = 500;

        if (user.totalPoints < HINT_COST) {
            return res.status(400).json({ 
                message: 'Insufficient points', 
                required: HINT_COST, 
                current: user.totalPoints 
            });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                totalPoints: { decrement: HINT_COST }
            }
        });

        res.status(200).json({
            message: 'Hint purchased successfully',
            totalPoints: updatedUser.totalPoints,
            hintCost: HINT_COST
        });
    } catch (error) {
        console.error('Buy Hint Error:', error);
        res.status(500).json({ message: 'Error purchasing hint' });
    }
};
