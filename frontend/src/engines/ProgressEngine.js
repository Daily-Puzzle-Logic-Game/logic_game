/**
 * ProgressEngine manages XP calculation and leveling milestones.
 * Now using a 100-node progressive scaling system with Elite ranks.
 */
class ProgressEngine {
    static XP_MAP = {
        PUZZLE_RESOLVE: 100,
        CHALLENGE_RESOLVE: 200,
        BONUS_SPEED: 50,
        BONUS_HINTLESS: 75,
        BONUS_PERFECT: 100,
        DAILY_STREAK_BONUS: 20,
    };

    /**
     * Tier Distribution (100 Levels)
     * Using formula: 125 * (L-1) * (L+6)
     */
    static LEVEL_TIERS = [
        { name: 'Bronze', range: [1, 10], baseXP: 0, color: '#CD7F32', shadow: 'rgba(205, 127, 50, 0.4)', icon: 'shield' },
        { name: 'Silver', range: [11, 25], baseXP: 21250, color: '#C0C0C0', shadow: 'rgba(192, 192, 192, 0.4)', icon: 'brain' },
        { name: 'Gold', range: [26, 40], baseXP: 100000, color: '#FFD700', shadow: 'rgba(255, 215, 0, 0.4)', icon: 'map' },
        { name: 'Platinum', range: [41, 55], baseXP: 235000, color: '#00D2FF', shadow: 'rgba(0, 210, 255, 0.4)', icon: 'cpu' },
        { name: 'Diamond', range: [56, 70], baseXP: 426250, color: '#FF00FF', shadow: 'rgba(255, 0, 255, 0.6)', icon: 'crown' },
        { name: 'Heroic', range: [71, 80], baseXP: 682500, color: '#FF0000', shadow: 'rgba(255, 0, 0, 0.6)', icon: 'zap' },
        { name: 'Elite Heroic', range: [81, 88], baseXP: 880000, color: '#FF4500', shadow: 'rgba(255, 69, 0, 0.7)', icon: 'zap' },
        { name: 'Master', range: [89, 94], baseXP: 1056000, color: '#8A2BE2', shadow: 'rgba(138, 43, 226, 0.7)', icon: 'trophy' },
        { name: 'Elite Master', range: [95, 99], baseXP: 1213250, color: '#9400D3', shadow: 'rgba(148, 0, 211, 0.8)', icon: 'crown' },
        { name: 'Grand Master', range: [100, 100], baseXP: 1311750, color: '#FFFF00', shadow: 'rgba(255, 255, 0, 0.8)', icon: 'trophy' },
    ];

    /**
     * Scaling Formula:
     * XP to next level n = 1000 + (n-1) * 250
     * Total XP to reach level L = 125 * (L-1) * (L+6)
     */
    static getXPForLevel(level) {
        if (level <= 1) return 0;
        return 125 * (level - 1) * (level + 6);
    }

    static getLevelFromXP(xp) {
        if (xp <= 0) return 1;
        // Quadratic: L = (-5 + sqrt(49 + xp/31.25)) / 2
        const level = Math.floor((-5 + Math.sqrt(49 + xp / 31.25)) / 2) + 1;
        return Math.min(100, level);
    }

    static getCurrentLevelInfo(input) {
        let totalXP = 0;
        if (typeof input === 'number') {
            totalXP = input;
        } else if (input && typeof input === 'object') {
            totalXP = input.totalXP || input.totalPoints || input.score || input.xp || 0;
        }

        const currentLevel = this.getLevelFromXP(totalXP);
        const nextLevel = Math.min(100, currentLevel + 1);
        
        const xpForCurrent = this.getXPForLevel(currentLevel);
        const xpForNext = this.getXPForLevel(nextLevel);
        
        const diff = xpForNext - xpForCurrent;
        const progress = diff > 0 ? ((totalXP - xpForCurrent) / diff) * 100 : 100;

        // Determine Tier
        const tier = this.LEVEL_TIERS.find(t => currentLevel >= t.range[0] && currentLevel <= t.range[1]) 
                   || this.LEVEL_TIERS[this.LEVEL_TIERS.length - 1];

        // SubRank logic: Map level within tier range to I-V
        let subRank = '';
        if (tier.name === 'Grand Master') {
            subRank = 'GLOBAL';
        } else {
            const rangeSize = tier.range[1] - tier.range[0] + 1;
            const step = Math.max(1, Math.ceil(rangeSize / 5));
            const subIdx = Math.floor((currentLevel - tier.range[0]) / step);
            const ranks = ['I', 'II', 'III', 'IV', 'V'];
            subRank = ranks[Math.min(4, subIdx)] || 'V';
        }

        return {
            ...tier,
            level: currentLevel,
            subRank: subRank,
            nextLevelXP: xpForNext,
            progress: Math.min(100, Math.floor(progress))
        };
    }

    static getReducedXP(currentXP) {
        const level = this.getLevelFromXP(currentXP);
        if (level >= 100) return this.getXPForLevel(81); // Reset to Elite Heroic
        if (level >= 80) return this.getXPForLevel(56);  // Reset to Diamond
        if (level >= 55) return this.getXPForLevel(26);  // Reset to Gold
        return 0; // Reset to Bronze
    }
}

export default ProgressEngine;
