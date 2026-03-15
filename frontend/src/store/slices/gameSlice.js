import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    currentPuzzle: null,
    streakCount: 0,
    journeyLevel: 1,
    hintsRemaining: 3,
    isSolving: false,
    
    // Engagement Metrics
    totalXP: 0,
    currentLevel: 1,
    hasStreakShield: false,
    
    // Performance Tracking
    stats: {
        totalSolved: 0,
        currentStreak: 0,
        bestTime: 0,
        perfectSolves: 0,
        sessionsCount: 0,
        avgSolveTime: 0,
        avgHints: 0,
        avgMistakes: 0,
        completionRate: 0,
    },
    
    // History for Heatmap (Array of { date, intensity })
    history: [],
};

export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        setCurrentPuzzle: (state, action) => {
            state.currentPuzzle = action.payload;
        },
        useHint: (state) => {
            if (state.hintsRemaining > 0) {
                state.hintsRemaining -= 1;
            }
        },
        setSolvingStatus: (state, action) => {
            state.isSolving = action.payload;
        },
        updateEngagement: (state, action) => {
            const { xp, level, streak, history, stats, hasShield, journeyLevel } = action.payload;
            if (xp !== undefined) state.totalXP = xp;
            if (level !== undefined) state.currentLevel = level;
            if (streak !== undefined) state.streakCount = streak;
            if (history !== undefined) state.history = history;
            if (stats !== undefined) state.stats = { ...state.stats, ...stats };
            if (hasShield !== undefined) state.hasStreakShield = hasShield;
            if (journeyLevel !== undefined) state.journeyLevel = journeyLevel;
        },
        addXP: (state, action) => {
            state.totalXP += action.payload;
        },
        buyHintSuccess: (state, action) => {
            // Deduct points and grant a hint
            state.totalXP = action.payload.totalPoints;
            state.hintsRemaining += 1;
        },
    },
});

export const { 
    setCurrentPuzzle, 
    useHint, 
    setSolvingStatus, 
    updateEngagement, 
    addXP,
    buyHintSuccess,
} = gameSlice.actions;
export default gameSlice.reducer;
