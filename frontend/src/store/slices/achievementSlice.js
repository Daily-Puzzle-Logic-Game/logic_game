import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    unlockedIds: [], // IDs of achievements unlocked in the current session
    progress: {},    // Local progress tracking if needed (e.g. { puzzle_master: 34 })
    lastUnlocked: null
};

const achievementSlice = createSlice({
    name: 'achievements',
    initialState,
    reducers: {
        unlockAchievement: (state, action) => {
            if (!state.unlockedIds.includes(action.payload.id)) {
                state.unlockedIds.push(action.payload.id);
                state.lastUnlocked = action.payload;
            }
        },
        updateProgress: (state, action) => {
            const { id, value } = action.payload;
            state.progress[id] = value;
        },
        clearLastUnlocked: (state) => {
            state.lastUnlocked = null;
        },
        hydrateAchievements: (state, action) => {
            state.unlockedIds = action.payload.map(a => a.id);
        }
    }
});

export const { unlockAchievement, updateProgress, clearLastUnlocked, hydrateAchievements } = achievementSlice.actions;
export default achievementSlice.reducer;
