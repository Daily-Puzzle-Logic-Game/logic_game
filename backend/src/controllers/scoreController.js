const prisma = require('../config/prisma');
const { createInternalNotification } = require('./notificationController');
const crypto = require('crypto');

// Sync Score
exports.syncScore = async (req, res) => {
    try {
        const { date, puzzleId, score, timeTaken, streakCount, totalPoints, hash, seed } = req.body;
        const userId = req.user.id;
        const newAchievements = [];

        // Anti-Cheat: Verify Score Hash
        const APP_SECRET = process.env.PUZZLE_SECRET_KEY || 'bluestock_secret_2026';
        const expectedPayload = `${userId}:${score}:${timeTaken}:${seed || date}:${APP_SECRET}`;
        const expectedHash = crypto.createHash('sha256').update(expectedPayload).digest('hex');

        if (hash !== expectedHash) {
            console.warn('SCORE TAMPERING DETECTED:', { userId, providedHash: hash, expectedHash });
            return res.status(403).json({ message: 'Security verification failed' });
        }

        const MAX_SCORE = 5000;
        const MAX_TIME = 86400; // 24 hours in seconds
        
        const now = new Date();
        const todayStr = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

        const parsedScore = parseInt(score, 10);
        const parsedTimeTaken = parseInt(timeTaken, 10);

        if ((!date.startsWith('practice-') && date > todayStr) || isNaN(parsedScore) || parsedScore < 0 || parsedScore > MAX_SCORE || isNaN(parsedTimeTaken) || parsedTimeTaken < 0 || parsedTimeTaken > MAX_TIME) {
            console.warn('REJECTED SCORE SUBMISSION:', { 
                userId, 
                date, 
                todayStr, 
                parsedScore, 
                parsedTimeTaken, 
                reason: date > todayStr ? 'Future date' : (isNaN(parsedScore) ? 'NaN score' : 'Other validation error')
            });
            return res.status(400).json({ message: 'Invalid score submission data' });
        }

        const existingScore = await prisma.dailyScore.findUnique({
            where: { userId_date: { userId, date } }
        });

        const prevScoreObj = existingScore ? existingScore.score : 0;
        const newScore = Math.max(score || 0, prevScoreObj);
        const pointDiff = newScore - prevScoreObj;

        const prevTime = existingScore ? existingScore.timeTaken : Infinity;
        const newTime = existingScore ? Math.min(timeTaken || Infinity, prevTime) : timeTaken;

        const isNewCompletion = !existingScore;

        const dailyScore = await prisma.dailyScore.upsert({
            where: { userId_date: { userId, date } },
            update: {
                score: newScore,
                timeTaken: newTime,
                puzzleId
            },
            create: {
                userId, date, puzzleId, score: newScore, timeTaken: newTime
            }
        });

        // Calculate Streak Logic on Backend
        const user = await prisma.user.findUnique({ where: { id: userId } });
        let newStreak = user.streakCount;

        if (true) { // Allow all game modes (including practice) to contribute to streak
            const today = new Date(todayStr);
            const lastPlayedDate = user.lastPlayed ? new Date(new Date(user.lastPlayed).getTime() - (new Date(user.lastPlayed).getTimezoneOffset() * 60000)).toISOString().split('T')[0] : null;
            
            if (!lastPlayedDate) {
                newStreak = 1;
            } else {
                const lastDate = new Date(lastPlayedDate);
                const diffTime = today - lastDate;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    newStreak = user.streakCount + 1;
                } else if (diffDays > 1) {
                    newStreak = 1; // Streak broken
                } else if (diffDays === 0) {
                    newStreak = user.streakCount; // Already played today
                }
            }
        }

        await prisma.user.update({
            where: { id: userId },
            data: {
                streakCount: newStreak,
                totalPoints: { increment: pointDiff },
                lastPlayed: new Date()
            }
        });

        // Achievements Logic
        const stats = await prisma.userStats.upsert({
            where: { userId },
            update: { puzzlesSolved: { increment: isNewCompletion ? 1 : 0 } },
            create: { userId, puzzlesSolved: 1 }
        });

        // Achievements Logic (Milestones 1, 6 & 7)
        if (stats.puzzlesSolved >= 1) {
            const hasAc = await prisma.achievement.findUnique({ where: { userId_badgeType: { userId, badgeType: 'first_blood' } } });
            if (!hasAc) {
                await prisma.achievement.create({ data: { userId, badgeType: 'first_blood' } });
                newAchievements.push('first_blood');
                await createInternalNotification(userId, 'Milestone 1 Achieved', 'First Blood! You solved your very first puzzle.', 'ACHIEVEMENT');
            }
        }

        if (stats.puzzlesSolved >= 50) {
            const hasAc = await prisma.achievement.findUnique({ where: { userId_badgeType: { userId, badgeType: 'puzzle_master' } } });
            if (!hasAc) {
                await prisma.achievement.create({ data: { userId, badgeType: 'puzzle_master' } });
                newAchievements.push('puzzle_master');
                await createInternalNotification(userId, 'Milestone 6 Achieved', 'Puzzle Master status unlocked! 50 puzzles successfully decrypted.', 'ACHIEVEMENT');
            }
        }

        if (streakCount >= 30) {
            const hasAc = await prisma.achievement.findUnique({ where: { userId_badgeType: { userId, badgeType: 'streak_keeper' } } });
            if (!hasAc) {
                await prisma.achievement.create({ data: { userId, badgeType: 'streak_keeper' } });
                newAchievements.push('streak_keeper');
                await createInternalNotification(userId, 'Milestone 7 Achieved', 'Streak Keeper status confirmed. 30-day logic pulse maintained.', 'ACHIEVEMENT');
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
                totalXP: entry.totalPoints,
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
                    select: { 
                        name: true, 
                        picture: true,
                        totalPoints: true,
                        streakCount: true
                    }
                }
            }
        });

        const leaderboard = topScores.map((entry, index) => ({
            rank: index + 1,
            id: entry.userId,
            name: entry.user.name || 'Anonymous',
            picture: entry.user.picture,
            score: entry.score,
            totalXP: entry.user.totalPoints,
            streak: entry.user.streakCount,
            time: entry.timeTaken
        }));

        res.status(200).json(leaderboard);
    } catch (error) {
        console.error('Leaderboard Error:', error);
        res.status(500).json({ message: 'Error fetching leaderboard' });
    }
};
// Batch Sync Scores (Offline-First Recovery)
exports.syncBatch = async (req, res) => {
    try {
        const { entries, totalPoints, streakCount, guestId } = req.body;
        let userId = req.user?.id;

        // Phase 15: Handle Guest Sync via placeholder users
        if (!userId && guestId) {
            const guestEmail = `guest_${guestId.toLowerCase()}@logiclooper.local`;
            const nameToUse = req.body.name || `Operative ${guestId.slice(-4)}`;
            let guestUser = await prisma.user.findUnique({ where: { email: guestEmail } });
            
            if (!guestUser) {
                guestUser = await prisma.user.create({
                    data: {
                        email: guestEmail,
                        name: nameToUse,
                        totalPoints: totalPoints || 0,
                        streakCount: streakCount || 0
                    }
                });
            } else if (req.body.name && guestUser.name !== req.body.name) {
                // Update name if guest has finally set one
                guestUser = await prisma.user.update({
                    where: { email: guestEmail },
                    data: { name: req.body.name }
                });
            }
            userId = guestUser.id;
        }

        if (!userId) {
            return res.status(401).json({ message: 'Authentication required for sync' });
        }

        if (!entries || !Array.isArray(entries)) {
            return res.status(400).json({ message: 'Invalid batch entries' });
        }

        const MAX_SCORE = 500;
        const MAX_TIME = 86400; // 24 hours in seconds
        
        // Get today's local date string reliably
        const now = new Date();
        const todayStr = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

        const validEntries = entries.filter((entry) => {
            const parsedScore = parseInt(entry.score, 10);
            const parsedTimeTaken = parseInt(entry.timeTaken, 10);
            
            // Anti-Cheat: Verify entry hash if provided
            const APP_SECRET = process.env.PUZZLE_SECRET_KEY || 'bluestock_secret_2026';
            const expectedPayload = `${userId}:${entry.score}:${entry.timeTaken}:${entry.seed || entry.date}:${APP_SECRET}`;
            const expectedHash = crypto.createHash('sha256').update(expectedPayload).digest('hex');

            if (entry.hash && entry.hash !== expectedHash) {
                console.warn(`Batch Sync Reject: Hash mismatch for ${entry.date}`);
                return false;
            }

            if (!entry.date.startsWith('practice-') && entry.date > todayStr) {
                console.warn(`Batch Sync Reject: Future date ${entry.date} > ${todayStr}`);
                return false;
            }
            if (isNaN(parsedScore) || parsedScore < 0 || parsedScore > MAX_SCORE) {
                console.warn(`Batch Sync Reject: Invalid score ${parsedScore}`);
                return false;
            }
            if (isNaN(parsedTimeTaken) || parsedTimeTaken < 0 || parsedTimeTaken > MAX_TIME) {
                console.warn(`Batch Sync Reject: Invalid time ${parsedTimeTaken}`);
                return false;
            }
            
            // Assign parsed back for safely entering into Db
            entry.score = parsedScore;
            entry.timeTaken = parsedTimeTaken;
            return true;
        });

        const syncResults = await Promise.all(validEntries.map(async (entry) => {
            const existingScore = await prisma.dailyScore.findUnique({
                where: { userId_date: { userId, date: entry.date } }
            });

            const prevScoreObj = existingScore ? existingScore.score : 0;
            const newScore = Math.max(entry.score || 0, prevScoreObj);
            const pointDiff = newScore - prevScoreObj;

            const prevTime = existingScore ? existingScore.timeTaken : Infinity;
            const newTime = existingScore ? Math.min(entry.timeTaken || Infinity, prevTime) : entry.timeTaken;
            const isNewCompletion = !existingScore;

            await prisma.dailyScore.upsert({
                where: { userId_date: { userId, date: entry.date } },
                update: {
                    score: newScore,
                    timeTaken: newTime,
                    puzzleId: entry.puzzleId || 'daily'
                },
                create: {
                    userId,
                    date: entry.date,
                    score: newScore,
                    timeTaken: newTime,
                    puzzleId: entry.puzzleId || 'daily'
                }
            });

            return { isNewCompletion, pointDiff };
        }));

        // Phase 17: Strict Additive Sync (Idempotent!)
        const earnedPoints = syncResults.reduce((sum, res) => sum + (res.pointDiff || 0), 0);
        const newCompletionsCount = syncResults.filter(r => r.isNewCompletion).length;
        
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                totalPoints: { increment: earnedPoints },
                // Streak is the maximum of what we have vs what was reported in this batch
                streakCount: { set: Math.max(user?.streakCount || 0, streakCount || 0) },
                lastPlayed: new Date()
            }
        });

        // Update UserStats and evaluate Achievements based on this sync batch
        const stats = await prisma.userStats.upsert({
            where: { userId },
            update: { puzzlesSolved: { increment: newCompletionsCount } },
            create: { userId, puzzlesSolved: newCompletionsCount }
        });

        // Achievements Logic (Milestones 1, 6 & 7)
        let newAchievementsCount = 0;
        
        if (stats.puzzlesSolved >= 1) {
            const hasAc = await prisma.achievement.findUnique({ where: { userId_badgeType: { userId, badgeType: 'first_blood' } } });
            if (!hasAc) {
                await prisma.achievement.create({ data: { userId, badgeType: 'first_blood' } });
                await createInternalNotification(userId, 'Milestone 1 Achieved', 'First Blood! You solved your very first puzzle.', 'ACHIEVEMENT');
                newAchievementsCount++;
            }
        }

        if (stats.puzzlesSolved >= 50) {
            const hasAc = await prisma.achievement.findUnique({ where: { userId_badgeType: { userId, badgeType: 'puzzle_master' } } });
            if (!hasAc) {
                await prisma.achievement.create({ data: { userId, badgeType: 'puzzle_master' } });
                await createInternalNotification(userId, 'Milestone 6 Achieved', 'Puzzle Master status unlocked! 50 puzzles successfully decrypted.', 'ACHIEVEMENT');
                newAchievementsCount++;
            }
        }

        const safeStreak = Math.max(streakCount || 0, user?.streakCount || 0);
        if (safeStreak >= 30) {
            const hasAc = await prisma.achievement.findUnique({ where: { userId_badgeType: { userId, badgeType: 'streak_keeper' } } });
            if (!hasAc) {
                await prisma.achievement.create({ data: { userId, badgeType: 'streak_keeper' } });
                await createInternalNotification(userId, 'Milestone 7 Achieved', 'Streak Keeper status confirmed. 30-day logic pulse maintained.', 'ACHIEVEMENT');
                newAchievementsCount++;
            }
        }

        const allAchievements = await prisma.achievement.findMany({
            where: { userId },
            select: { badgeType: true }
        });

        res.status(200).json({
            message: `Successfully synced ${syncResults.length} records and profile points`,
            count: syncResults.length,
            achievementsUnlocked: newAchievementsCount,
            totalPoints: user.totalPoints,
            streakCount: user.streakCount,
            userId: userId, // Returned for frontend dbId mapping
            achievements: allAchievements.map(a => a.badgeType)
        });
    } catch (error) {
        console.error('Batch Sync Error:', error);
        res.status(500).json({ message: 'Error during batch sync' });
    }
};
