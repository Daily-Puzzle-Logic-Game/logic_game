import { createSlice } from '@reduxjs/toolkit';

const loadInitialState = () => {
    try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
            return {
                user: JSON.parse(userStr),
                token: token,
                isAuthenticated: true,
                isGuest: false,
            };
        }
    } catch (e) {
        console.warn('Failed to parse auth from localStorage');
    }
    
    return {
        user: null, // Will hold Google/Truecaller user info
        token: null, // Our internal JWT
        isAuthenticated: false,
        isGuest: false, 
    };
};

const initialState = loadInitialState();

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            const { user, token } = action.payload;
            state.user = user;
            state.token = token;
            state.isAuthenticated = true;
            state.isGuest = false;
            
            // Persist to browser storage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.isGuest = false;
            
            // Clear browser storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
        guestLogin: (state, action) => {
            const { name } = action.payload;
            state.user = { name };
            state.token = null;
            state.isAuthenticated = false;
            state.isGuest = true;
        }
    }
});

export const { loginSuccess, logout, guestLogin } = authSlice.actions;
export default authSlice.reducer;
