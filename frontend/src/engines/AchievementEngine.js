/**
 * AchievementEngine tracks badge progress and psychological near-unlock nudges.
 */
class AchievementEngine {
    static BADGES = [
        { id: 'FIRST_SOLVE', name: 'Neural Spark', description: 'Solve your first logical node.', threshold: 1, type: 'COUNT' },
        { id: 'TEN_SOLVES', name: 'Logic Technician', description: 'Complete 10 logic simulations.', threshold: 10, type: 'COUNT' },
        { id: 'FIFTY_SOLVES', name: 'Simulation Architect', description: 'Master 50 logical sequences.', threshold: 50, type: 'COUNT' },
        { id: 'THREE_DAY_STREAK', name: 'Steady Pulse', description: 'Maintain a 3-day logical streak.', threshold: 3, type: 'STREAK' },
        { id: 'SEVEN_DAY_STREAK', name: 'Cognitive Flow', description: 'Solve puzzles for 7 consecutive days.', threshold: 7, type: 'STREAK' },
        { id: 'SPEED_DEMON', name: 'Overclocked', description: 'Solve a puzzle in under 60 seconds.', threshold: 60, type: 'TIME_UNDER' },
        { id: 'PERFECTIONIST', name: 'Zero Error', description: 'Solve 5 puzzles with zero mistakes.', threshold: 5, type: 'MISTAKE_COUNT' },
    ];

    /**
     * Checks which badges are newly unlocked or in progress.
     * @param {Object} userStats - User stats including counts, streaks, best times.
     */
    static checkProgress(userStats) {
        return this.BADGES.map(badge => {
            let current = 0;
            let unlocked = false;

            switch (badge.id) {
                case 'FIRST_SOLVE': 
                case 'TEN_SOLVES': 
                case 'FIFTY_SOLVES': 
                    current = userStats.totalSolved;
                    unlocked = current >= badge.threshold;
                    break;
                case 'THREE_DAY_STREAK':
                case 'SEVEN_DAY_STREAK':
                    current = userStats.currentStreak;
                    unlocked = current >= badge.threshold;
                    break;
                case 'SPEED_DEMON':
                    current = userStats.bestTime; // Best time in seconds
                    unlocked = current > 0 && current <= badge.threshold;
                    break;
                case 'PERFECTIONIST':
                    current = userStats.perfectSolves;
                    unlocked = current >= badge.threshold;
                    break;
            }

            return {
                ...badge,
                current,
                progress: Math.min(100, Math.floor((current / badge.threshold) * 100)),
                unlocked,
                isNear: !unlocked && (current / badge.threshold) >= 0.8 // Near-unlock if 80%+ done
            };
        });
    }
}

export default AchievementEngine;
