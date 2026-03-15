import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { UNLOCK_REQUIREMENTS } from '../config/puzzleTypes';

/**
 * useEngagement - Hook for handling game-psychology engagement logic.
 * Handles:
 * 1. Near-Miss calculation
 * 2. Puzzle Unlock checks
 * 3. Daily Reward status (placeholder for logic)
 */
export const useEngagement = (userStats) => {
    const solvedCount = userStats?.puzzlesSolved ?? userStats?.stats?.puzzlesSolved ?? 0;

    // Check Unlocks
    const unlockedModes = useMemo(() => {
        return Object.entries(UNLOCK_REQUIREMENTS).filter(([id, req]) => {
            return solvedCount >= req;
        }).map(([id]) => id);
    }, [solvedCount]);

    const isModeUnlocked = (mode) => {
        return unlockedModes.includes(mode);
    };

    /**
     * Near-Miss Logic
     * Calculates if the player is "one step away" from victory.
     * This is puzzle-specific but can be generalized here if needed.
     */
    const getNearMissStatus = (completionPercentage) => {
        // Typically triggered between 85% and 99%
        return completionPercentage >= 90 && completionPercentage < 100;
    };

    const getDailyRewardSchedule = () => [
        { day: 1, reward: '+1 Hint', icon: 'zap' },
        { day: 2, reward: '+1 Hint', icon: 'zap' },
        { day: 3, reward: '+2 Hints', icon: 'zap' },
        { day: 4, reward: '+3 Hints', icon: 'sparkles' },
        { day: 5, reward: '+5 Hints', icon: 'flame' },
        { day: 6, reward: '+1 Shield', icon: 'shield' },
        { day: 7, reward: 'Mystery', icon: 'gift' },
    ];

    return {
        unlockedModes,
        isModeUnlocked,
        getNearMissStatus,
        getDailyRewardSchedule,
        solvedCount
    };
};
