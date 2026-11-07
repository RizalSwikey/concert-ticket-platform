require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    console.log('MongoDB connected successfully.');
    app.listen(PORT, () => {
      console.log(`Concert Anti-Double Booking API running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB on startup:', err.message);
    // Still start server so health / informative response is returned
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT} with DB connection pending.`);
    });
  });
