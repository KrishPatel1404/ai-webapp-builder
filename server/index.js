const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

// Import routes
const authRoutes = require('./routes/auth');
const requirementsRoutes = require('./routes/requirements');

// MongoDB connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
};

// Connect to database
connectDB();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/requirements', requirementsRoutes);

// Basic Hello World route
app.get('/', (req, res) => {
    res.json({
        message: 'Mini AI App Builder API - Hello World!',
        status: 'Server is running successfully',
        timestamp: new Date().toISOString(),
        port: PORT
    });
});

// Health check route
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        uptime: process.uptime()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: err.message
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});