import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// API Proxy logic (Phase 16.1)
const API_URL = '/api';

export const fetchNotifications = createAsyncThunk(
    'notifications/fetchAll',
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            const response = await axios.get(`/api/notifications`, config);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch');
        }
    }
);

export const markNotificationAsRead = createAsyncThunk(
    'notifications/markRead',
    async (id, { getState, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            await axios.put(`/api/notifications/${id}/read`, {}, config);
            return id;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const markAllAsRead = createAsyncThunk(
    'notifications/markAllRead',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            await axios.put(`/api/notifications/read-all`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return true;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to mark all as read');
        }
    }
);

export const clearNotifications = createAsyncThunk(
    'notifications/clearAll',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            await axios.delete(`/api/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return true;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to clear notifications');
        }
    }
);

const notificationSlice = createSlice({
    name: 'notifications',
    initialState: {
        items: [],
        loading: false,
        error: null,
        unreadCount: 0
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
                state.unreadCount = action.payload.filter(n => !n.read).length;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(markNotificationAsRead.fulfilled, (state, action) => {
                const item = state.items.find(n => n.id === action.payload);
                if (item && !item.read) {
                    item.read = true;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })
            .addCase(markAllAsRead.fulfilled, (state) => {
                state.items.forEach(n => { n.read = true; });
                state.unreadCount = 0;
            })
            .addCase(clearNotifications.fulfilled, (state) => {
                state.items = [];
                state.unreadCount = 0;
            });
    }
});

export default notificationSlice.reducer;
