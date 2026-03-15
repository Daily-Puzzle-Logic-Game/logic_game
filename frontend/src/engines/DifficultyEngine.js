/**
 * DifficultyEngine adapts puzzle complexity based on historical performance.
 * Tiers: Beginner (1), Intermediate (2), Advanced (3), Expert (4)
 */
class DifficultyEngine {
    static PERFORMANCE_THRESHOLDS = {
        ADAPT_UP: {
            SOLVE_TIME_MAX: 180, // Seconds (3 mins)
            HINTS_MAX: 0,
            MISTAKES_MAX: 1,
            STREAK_MIN: 3
        },
        ADAPT_DOWN: {
            SOLVE_TIME_MIN: 600, // Seconds (10 mins)
            COMPLETION_RATE_MIN: 0.5,
            HINT_USAGE_HIGH: 3
        }
    };

    /**
     * Calculates the suggested difficulty for the next puzzle.
     * @param {Object} stats - User performance metrics
     * @param {number} currentLevel - Current difficulty level (1-4)
     */
    static suggestNext(stats, currentLevel) {
        const { avgSolveTime, avgHints, avgMistakes, completionRate, winStreak } = stats;

        // Don't adapt too aggressively - require at least 3 sessions of data
        if (stats.sessionsCount < 3) return currentLevel;

        const p = this.PERFORMANCE_THRESHOLDS;

        // Logic to Move Up
        if (currentLevel < 4) {
            if (avgSolveTime <= p.ADAPT_UP.SOLVE_TIME_MAX && 
                avgHints <= p.ADAPT_UP.HINTS_MAX &&
                winStreak >= p.ADAPT_UP.STREAK_MIN) {
                return currentLevel + 1;
            }
        }

        // Logic to Move Down
        if (currentLevel > 1) {
            if (avgSolveTime >= p.ADAPT_DOWN.SOLVE_TIME_MIN || 
                avgHints >= p.ADAPT_DOWN.HINT_USAGE_HIGH ||
                completionRate < p.ADAPT_DOWN.COMPLETION_RATE_MIN) {
                return currentLevel - 1;
            }
        }

        return currentLevel;
    }

    static levelToName(level) {
        const names = { 1: 'beginner', 2: 'intermediate', 3: 'advanced', 4: 'expert' };
        return names[level] || 'intermediate';
    }

    static nameToLevel(name) {
        const levels = { 'beginner': 1, 'intermediate': 2, 'medium': 2, 'advanced': 3, 'expert': 4 };
        return levels[name] || 2;
    }
}

export default DifficultyEngine;
