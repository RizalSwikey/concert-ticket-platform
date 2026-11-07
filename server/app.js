const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const concertRoutes = require('./routes/concertRoutes');
const seatRoutes = require('./routes/seatRoutes');
const orderRoutes = require('./routes/orderRoutes');
const seedRoutes = require('./routes/seedRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Health check (lightweight probe)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Concert Anti-Double Booking Engine',
    author: 'Rizal Akbar Syah Fauzan Putra (@RizalSwikey)',
    timestamp: new Date().toISOString()
  });
});

// Ensure MongoDB is connected before handling data requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Database connection failed. Please ensure MongoDB is running or MONGODB_URI is configured.'
    });
  }
});

// Routes
app.use('/api', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/concerts', concertRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/seed', seedRoutes);

// Fallback error handler
app.use(errorHandler);

module.exports = app;
