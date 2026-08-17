import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, 
      socketTimeoutMS: 45000,         
      family: 4,                      
      tlsAllowInvalidCertificates: true
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Auto-seed initial catalog if database is empty
    try {
      const { autoSeedDatabase } = await import('../utils/autoSeed.js');
      await autoSeedDatabase();
    } catch (seedErr) {
      console.error('Auto-seed error:', seedErr.message);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // Don't exit process in development to allow nodemon to retry
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

export default connectDB;
