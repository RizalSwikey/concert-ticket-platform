require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { seedDatabase } = require('../controllers/seedController');

async function runSeed() {
  console.log('Connecting to MongoDB for local seeding...');
  await connectDB();
  console.log('Connected. Running seed controller...');

  const mockReq = {};
  const mockRes = {
    json: (data) => {
      console.log('Seed completed successfully:');
      console.log(JSON.stringify(data, null, 2));
      process.exit(0);
    },
    status: (code) => ({
      json: (data) => {
        console.error(`Seed failed with status ${code}:`, data);
        process.exit(1);
      }
    })
  };

  const mockNext = (err) => {
    console.error('Seed threw error:', err);
    process.exit(1);
  };

  await seedDatabase(mockReq, mockRes, mockNext);
}

runSeed().catch((err) => {
  console.error('Seeding process fatal error:', err);
  process.exit(1);
});
