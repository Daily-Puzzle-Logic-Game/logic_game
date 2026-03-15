import { ACHIEVEMENTS } from '../config/achievements';

/**
 * Checks if any specific achievements are met based on the current session result.
 * @param {Object} session - Current session data { timeTaken, score, hintsUsed, puzzleType }
 * @param {Object} user - User stats { totalPoints, streakCount, totalSolved }
 * @param {Array} unlockedIds - Previously unlocked achievement IDs
 */
export const checkAchievements = (session, user, unlockedIds) => {
    const newUnlocks = [];

    const isUnlocked = (id) => unlockedIds.includes(id);

    // 1. First Solve
    if (!isUnlocked(ACHIEVEMENTS.FIRST_SOLVE.id)) {
        newUnlocks.push(ACHIEVEMENTS.FIRST_SOLVE);
    }

    // 2. Speed Demon (< 30s)
    if (session.timeTaken < ACHIEVEMENTS.SPEED_DEMON.requirement && !isUnlocked(ACHIEVEMENTS.SPEED_DEMON.id)) {
        newUnlocks.push(ACHIEVEMENTS.SPEED_DEMON);
    }

    // 3. Streak Milestones
    const potentialStreak = user.streakCount + (session.isDaily ? 1 : 0);
    
    if (potentialStreak >= 3 && !isUnlocked(ACHIEVEMENTS.STREAK_3.id)) {
        newUnlocks.push(ACHIEVEMENTS.STREAK_3);
    }
    if (potentialStreak >= 7 && !isUnlocked(ACHIEVEMENTS.STREAK_7.id)) {
        newUnlocks.push(ACHIEVEMENTS.STREAK_7);
    }

    // 4. Puzzle Master
    if ((user.totalSolved || 0) + 1 >= 100 && !isUnlocked(ACHIEVEMENTS.PUZZLE_MASTER.id)) {
        newUnlocks.push(ACHIEVEMENTS.PUZZLE_MASTER);
    }

    return newUnlocks;
};
