import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    currentPuzzle: null,
    streakCount: 0,
    hintsRemaining: 3,
    isSolving: false,
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
    },
});

export const { setCurrentPuzzle, useHint, setSolvingStatus } = gameSlice.actions;
export default gameSlice.reducer;
