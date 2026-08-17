import mongoose from 'mongoose';
import dotenv from 'dotenv';
import autoSeedDatabase from './utils/autoSeed.js';

dotenv.config();

async function runSeed() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      tlsAllowInvalidCertificates: true
    });
    console.log('Connected to MongoDB.');

    const result = await autoSeedDatabase({ force: true });
    console.log('Seed result:', result);

    await mongoose.disconnect();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

runSeed();
