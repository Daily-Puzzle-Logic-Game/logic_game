import dayjs from 'dayjs';

/**
 * StreakEngine manages daily habit formation and streak protection.
 * Visual Tiers: 
 * - 3 days: SMALL_FLAME
 * - 7 days: STRONG_FLAME
 * - 14 days: GLOWING_AURA
 * - 30 days: BLAZING_STREAK
 */
class StreakEngine {
    static getVisualTier(streakCount) {
        if (streakCount >= 30) return 'BLAZING_STREAK';
        if (streakCount >= 14) return 'GLOWING_AURA';
        if (streakCount >= 7) return 'STRONG_FLAME';
        if (streakCount >= 3) return 'SMALL_FLAME';
        return 'NONE';
    }

    /**
     * Checks if the streak is broken or should be maintained.
     * @param {string} lastSolvedDate - ISO string of last completion
     * @param {boolean} hasShield - If user has an active shield
     * @returns {Object} { status: 'INCREASE'|'MAINTAIN'|'BROKEN'|'PROTECTED', newStreak: number }
     */
    static checkStatus(lastSolvedDate, currentStreak, hasShield) {
        const today = dayjs().startOf('day');
        if (!lastSolvedDate) return { status: 'INCREASE', newStreak: 1 };
        const last = dayjs(lastSolvedDate).startOf('day');
        const diff = today.diff(last, 'day');

        if (diff === 0) return { status: 'MAINTAIN', newStreak: currentStreak };
        if (diff === 1) return { status: 'INCREASE', newStreak: currentStreak + 1 };
        
        if (diff > 1 && hasShield) {
            return { status: 'PROTECTED', newStreak: currentStreak, shieldUsed: true };
        }

        return { status: 'BROKEN', newStreak: 0 };
    }

    static calculateShieldAvailability(lastShieldUsedDate) {
        if (!lastShieldUsedDate) return true;
        const last = dayjs(lastShieldUsedDate);
        return dayjs().diff(last, 'day') >= 7; // One shield per week
    }
}

export default StreakEngine;
