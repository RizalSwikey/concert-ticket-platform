const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri || !uri.startsWith('mongodb')) {
    global.__isFallbackMode = true;
    return null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 4000,
      socketTimeoutMS: 45000
    };

    cached.promise = mongoose
      .connect(uri, opts)
      .then((m) => {
        global.__isFallbackMode = false;
        return m;
      })
      .catch((err) => {
        console.warn('MongoDB connection failed. Switching to In-Memory High-Concurrency Engine:', err.message);
        global.__isFallbackMode = true;
        cached.promise = null;
        return null;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    global.__isFallbackMode = true;
    cached.promise = null;
    return null;
  }

  return cached.conn;
}

module.exports = connectDB;
