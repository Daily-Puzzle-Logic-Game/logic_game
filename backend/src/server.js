require('dotenv').config();
const express = require('express');
const cors = require('cors');
const prisma = require('./config/prisma');

const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Global Rate Limiter (generous for reads like notifications, leaderboard, user data)
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // 500 requests per 15 min — covers polling + navigation
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later.' }
});

// Stricter limiter for performance-heavy or reward-critical endpoints
const syncLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 syncs per hour (generous for current batching)
    message: { message: 'Sync frequency limit reached. Batching active.' }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/', globalLimiter);
app.use('/api/scores/sync', syncLimiter);
app.use('/api/scores/sync-batch', syncLimiter);

// Routes
const authRoutes = require('./routes/authRoute');
const userRoutes = require('./routes/userRoute');
const scoreRoutes = require('./routes/scoreRoute');
const notificationRoutes = require('./routes/notificationRoute');
const rewardRoutes = require('./routes/rewardRoute');

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/rewards', rewardRoutes);

// Basic Health Check Endpoint
app.get('/api/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({ status: 'OK', database: 'Connected', timestamp: new Date() });
    } catch (error) {
        console.error('Database connection failed:', error);
        res.status(503).json({ status: 'ERROR', database: 'Disconnected', error: error.message });
    }
});

// Export for Vercel
module.exports = app;

// Start Server locally
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Logic Looper Backend running on http://localhost:${PORT}`);
    });
}
