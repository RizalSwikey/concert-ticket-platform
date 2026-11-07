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
    storageMode: global.__isFallbackMode ? 'IN_MEMORY_CONCURRENT_STORE' : 'MONGODB_ATLAS',
    author: 'Rizal Akbar Syah Fauzan Putra (@RizalSwikey)',
    timestamp: new Date().toISOString()
  });
});

// Initialize storage (MongoDB or resilient In-Memory Fallback)
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    global.__isFallbackMode = true;
  }
  next();
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
