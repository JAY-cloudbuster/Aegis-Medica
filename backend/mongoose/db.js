/**
 * Aegis Medical — MongoDB Connection Layer
 * ==========================================
 * Connects to MongoDB Atlas (if MONGO_URI set) or spins up an 
 * in-memory MongoDB server for zero-install development.
 */

const mongoose = require('mongoose');
const logger = require('./logger');

let mongoServer = null;

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (uri) {
    // ── Production / Atlas connection ──
    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    logger.info('🗄️  Connected to MongoDB Atlas');
  } else {
    // ── Dev: In-memory MongoDB (zero install) ──
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoServer = await MongoMemoryServer.create();
    const memUri = mongoServer.getUri();
    await mongoose.connect(memUri);
    logger.info('🗄️  Connected to in-memory MongoDB (dev mode)');
    logger.warn('⚠️  Data will be lost on restart. Set MONGO_URI for persistence.');
  }

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });
}

async function disconnectDB() {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
}

module.exports = { connectDB, disconnectDB };
