import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './slices/gameSlice';
import authReducer from './slices/authSlice';
import notificationReducer from './slices/notificationSlice';
import achievementReducer from './slices/achievementSlice';

export const store = configureStore({
    reducer: {
        game: gameReducer,
        auth: authReducer,
        notifications: notificationReducer,
        achievements: achievementReducer
    },
});
