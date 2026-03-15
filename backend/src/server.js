require('dotenv').config();
const express = require('express');
const cors = require('cors');
const prisma = require('./config/prisma');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoute');
const userRoutes = require('./routes/userRoute');
const scoreRoutes = require('./routes/scoreRoute');
const notificationRoutes = require('./routes/notificationRoute');

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/notifications', notificationRoutes);

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

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Logic Looper Backend running on http://localhost:${PORT}`);
});
