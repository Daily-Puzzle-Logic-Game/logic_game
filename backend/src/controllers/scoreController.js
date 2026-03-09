const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Sync Score
exports.syncScore = async (req, res) => {
    try {
        const { date, puzzleId, score, timeTaken, streakCount, totalPoints } = req.body;
        const userId = req.user.id;

        const dailyScore = await prisma.dailyScore.upsert({
            where: { userId_date: { userId, date } },
            update: {
                score: Math.max(score, 0),
                timeTaken,
                puzzleId
            },
            create: {
                userId, date, puzzleId, score, timeTaken
            }
        });

        await prisma.user.update({
            where: { id: userId },
            data: {
                streakCount: Math.max(streakCount || 0, 0),
                totalPoints: { increment: score || 0 },
                lastPlayed: new Date()
            }
        });

        // Achievements Logic
        const stats = await prisma.userStats.upsert({
            where: { userId },
            update: { puzzlesSolved: { increment: 1 } },
            create: { userId, puzzlesSolved: 1 }
        });

        const newAchievements = [];
        
        if (stats.puzzlesSolved >= 50) {
            const hasAc = await prisma.achievement.findUnique({ where: { userId_badgeType: { userId, badgeType: 'SOLVED_50' } } });
            if (!hasAc) {
                await prisma.achievement.create({ data: { userId, badgeType: 'SOLVED_50' } });
                newAchievements.push('SOLVED_50');
            }
        }
        
        if (streakCount >= 30) {
            const hasAc = await prisma.achievement.findUnique({ where: { userId_badgeType: { userId, badgeType: 'STREAK_30' } } });
            if (!hasAc) {
                await prisma.achievement.create({ data: { userId, badgeType: 'STREAK_30' } });
                newAchievements.push('STREAK_30');
            }
        }

        res.status(200).json({ message: 'Score synced successfully', dailyScore, achievements: newAchievements });
    } catch (error) {
        console.error('Sync Score Error:', error);
        res.status(500).json({ message: 'Error syncing score' });
    }
};

// Get Leaderboard
exports.getLeaderboard = async (req, res) => {
    try {
        const { date } = req.query; // YYYY-MM-DD
        let topScores = [];
        if (!date) {
            // Fetch ALL TIME Leaderboard if no date sent
            topScores = await prisma.user.findMany({
                orderBy: [
                    { totalPoints: 'desc' },
                ],
                take: 100,
                select: {
                    id: true,
                    name: true,
                    picture: true,
                    totalPoints: true,
                    streakCount: true
                }
            });
            const leaderboard = topScores.map((entry, index) => ({
                rank: index + 1,
                id: entry.id,
                name: entry.name || 'Anonymous',
                picture: entry.picture,
                score: entry.totalPoints,
                streak: entry.streakCount
            }));
            return res.status(200).json(leaderboard);
        }

        topScores = await prisma.dailyScore.findMany({
            where: { date },
            orderBy: [
                { score: 'desc' },
                { timeTaken: 'asc' }
            ],
            take: 100,
            include: {
                user: {
                    select: { name: true, picture: true }
                }
            }
        });

        const leaderboard = topScores.map((entry, index) => ({
            rank: index + 1,
            id: entry.userId,
            name: entry.user.name || 'Anonymous',
            picture: entry.user.picture,
            score: entry.score,
            time: entry.timeTaken
        }));

        res.status(200).json(leaderboard);
    } catch (error) {
        console.error('Leaderboard Error:', error);
        res.status(500).json({ message: 'Error fetching leaderboard' });
    }
};
