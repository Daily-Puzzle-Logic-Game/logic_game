const prisma = require('../config/prisma');
const { createInternalNotification } = require('./notificationController');

/**
 * getRewardStatus - Checks if the user can claim a reward today
 */
exports.getRewardStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                rewardStreak: true,
                lastRewardClaim: true
            }
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        const now = new Date();
        const todayStr = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        
        const lastClaimDate = user.lastRewardClaim 
            ? new Date(new Date(user.lastRewardClaim).getTime() - (new Date(user.lastRewardClaim).getTimezoneOffset() * 60000)).toISOString().split('T')[0]
            : null;

        const isClaimedToday = lastClaimDate === todayStr;
        
        let canClaim = !isClaimedToday;
        let streak = user.rewardStreak;

        // Check if streak was broken (missed yesterday)
        if (lastClaimDate) {
            const lastDate = new Date(lastClaimDate);
            const todayDate = new Date(todayStr);
            const diffTime = todayDate - lastDate;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 1) {
                // Missed at least one day
                streak = 0; 
            }
        }

        res.status(200).json({
            canClaim,
            isClaimedToday,
            currentStreak: streak,
            lastClaimDate: user.lastRewardClaim
        });

    } catch (error) {
        console.error('Get Reward Status Error:', error);
        res.status(500).json({ message: 'Error checking reward status' });
    }
};

/**
 * claimDailyReward - Claims the reward and updates the streak
 */
exports.claimDailyReward = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        const now = new Date();
        const todayStr = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        
        const lastClaimDate = user.lastRewardClaim 
            ? new Date(new Date(user.lastRewardClaim).getTime() - (new Date(user.lastRewardClaim).getTimezoneOffset() * 60000)).toISOString().split('T')[0]
            : null;

        if (lastClaimDate === todayStr) {
            return res.status(400).json({ message: 'Reward already claimed today' });
        }

        let newStreak = 1;
        if (lastClaimDate) {
            const lastDate = new Date(lastClaimDate);
            const todayDate = new Date(todayStr);
            const diffTime = todayDate - lastDate;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                newStreak = user.rewardStreak + 1;
            } else {
                newStreak = 1; // Streak broken or missed
            }
        }

        // Define Rewards (example logic)
        // Day 1: 50 pts, Day 2: 100 pts, etc.
        const rewardPoints = newStreak * 50; 
        
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                totalPoints: { increment: rewardPoints },
                rewardStreak: newStreak,
                lastRewardClaim: new Date()
            }
        });

        await createInternalNotification(
            userId, 
            'Daily Reward Protocol', 
            `Successfully claimed Day ${newStreak} reward: ${rewardPoints} XP added to neural core.`, 
            'SYSTEM'
        );

        res.status(200).json({
            message: 'Reward claimed successfully',
            newStreak,
            rewardPoints,
            totalPoints: updatedUser.totalPoints
        });

    } catch (error) {
        console.error('Claim Reward Error:', error);
        res.status(500).json({ message: 'Error claiming daily reward' });
    }
};
