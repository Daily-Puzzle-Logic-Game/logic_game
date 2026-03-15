export const ACHIEVEMENTS = {
    // Gameplay
    FIRST_SOLVE: {
        id: 'first_blood',
        name: 'First Blood',
        category: 'Gameplay',
        rarity: 'Common',
        icon: 'zap',
        description: 'Complete your first logic puzzle.',
        requirement: 1
    },
    PUZZLE_MASTER: {
        id: 'puzzle_master',
        name: 'Puzzle Master',
        category: 'Gameplay',
        rarity: 'Legendary',
        icon: 'star',
        description: 'Solve 100 logic puzzles across any mode.',
        requirement: 100
    },
    // Streak
    STREAK_3: {
        id: 'streak_3',
        name: 'Triple Threat',
        category: 'Streak',
        rarity: 'Common',
        icon: 'flame',
        description: 'Maintain a 3-day logic streak.',
        requirement: 3
    },
    STREAK_7: {
        id: 'streak_7',
        name: 'Weekly Warrior',
        category: 'Streak',
        rarity: 'Rare',
        icon: 'flame',
        description: 'Maintain a 7-day logic streak.',
        requirement: 7
    },
    STREAK_30: {
        id: 'streak_keeper',
        name: 'Logic Legend',
        category: 'Streak',
        rarity: 'Epic',
        icon: 'flame',
        description: 'Maintain a 30-day logic streak.',
        requirement: 30
    },
    STREAK_365: {
        id: 'streak_365',
        name: 'The Immortal',
        category: 'Streak',
        rarity: 'Legendary',
        icon: 'award',
        description: 'Complete a full year of logic puzzles without breaking the streak.',
        requirement: 365
    },
    // Speed
    SPEED_DEMON: {
        id: 'speed_demon',
        name: 'Speed Demon',
        category: 'Speed',
        rarity: 'Rare',
        icon: 'zap',
        description: 'Solve a puzzle in under 30 seconds.',
        requirement: 30 // Seconds threshold or 1 if boolean, for now let's use as flag
    },
    // Mastery
    HINTLESS_7: {
        id: 'hintless_hero',
        name: 'Hintless Hero',
        category: 'Mastery',
        rarity: 'Epic',
        icon: 'shield-check',
        description: 'Solve 7 puzzles in a row without using a single hint.',
        requirement: 7
    },
    PERFECT_SESSION: {
        id: 'perfect_session',
        name: 'Perfect Session',
        category: 'Mastery',
        rarity: 'Rare',
        icon: 'star',
        description: 'Complete a puzzle in under 2 minutes with 0 errors.',
        requirement: 1
    },
    // Special
    NIGHT_OWL: {
        id: 'night_owl',
        name: 'Night Owl',
        category: 'Special',
        rarity: 'Rare',
        icon: 'zap',
        description: 'Complete a puzzle between 12 AM and 4 AM.',
        requirement: 1
    },
    GOD_MODE: {
        id: 'god_mode',
        name: 'The Immortal',
        category: 'Special',
        rarity: 'Legendary',
        icon: 'award',
        description: 'Reach a 100-day streak.',
        requirement: 100
    }
};

export const RARITY_CONFIG = {
    Common: {
        glow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)] border-blue-500/30',
        text: 'text-blue-400',
        label: 'Common'
    },
    Rare: {
        glow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)] border-purple-500/40',
        text: 'text-purple-400',
        label: 'Rare'
    },
    Epic: {
        glow: 'shadow-[0_0_25px_rgba(234,179,8,0.5)] border-yellow-500/50',
        text: 'text-yellow-400',
        label: 'Epic'
    },
    Legendary: {
        glow: 'shadow-[0_0_35px_rgba(236,72,153,0.6)] border-pink-500/60',
        text: 'text-pink-400',
        label: 'Legendary'
    }
};

export const CATEGORIES = ['Gameplay', 'Streak', 'Speed', 'Mastery', 'Special'];
