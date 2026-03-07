import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null, // Will hold Google/Truecaller user info
    token: null, // Our internal JWT
    isAuthenticated: false,
    isGuest: true, // Everyone starts as a guest relying on IndexedDB
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.isGuest = false;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.isGuest = true;
        }
    }
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
