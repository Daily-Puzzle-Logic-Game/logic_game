import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './slices/gameSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
    reducer: {
        game: gameReducer,
        auth: authReducer,
    },
});
