import { createSlice } from '@reduxjs/toolkit';

const loadInitialState = () => {
    try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        const isGuest = localStorage.getItem('isGuest') === 'true';
        
        if (token && userStr) {
            return {
                user: JSON.parse(userStr),
                token: token,
                isAuthenticated: !isGuest,
                isGuest: isGuest,
            };
        }

        // Token exists but no user object — likely a guest who was saved before this fix
        if (token && isGuest) {
            return {
                user: { name: 'GUEST_OPERATIVE' },
                token: token,
                isAuthenticated: false,
                isGuest: true,
            };
        }
    } catch (e) {
        console.warn('Failed to parse auth from localStorage');
    }
    
    return {
        user: null,
        token: null,
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
            localStorage.removeItem('isGuest');
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.isGuest = false;
            
            // Clear browser storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('isGuest');
        },
        guestLogin: (state, action) => {
            const { user, token } = action.payload;
            state.user = user;
            state.token = token || null;
            state.isAuthenticated = false;
            state.isGuest = true;

            // Persist guest session so it survives reload/logout-login
            if (token) localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('isGuest', 'true');
        }
    }
});

export const { loginSuccess, logout, guestLogin } = authSlice.actions;
export default authSlice.reducer;
