import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: { type: String, select: false },
  role: { type: String, default: 'user' },
  refreshTokens: [{ token: String, createdAt: Date, expiresAt: Date }],
  isActive: { type: Boolean, default: true },
  emailVerified: { type: Boolean, default: false },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date
}, { timestamps: true });

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Reset any locked/rate-limited admin accounts
    await User.updateMany({}, { 
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 0, isActive: true }
    });
    console.log('✅ Reset all account locks and login attempts');

    // Check if admin exists
    const existing = await User.findOne({ email: 'admin@ecommerce.com' }).select('+password');
    
    if (existing) {
      // Update to ensure admin role and reset password
      const hashedPassword = await bcrypt.hash('Admin@123456', 12);
      await User.updateOne(
        { email: 'admin@ecommerce.com' },
        { 
          role: 'admin', 
          isActive: true, 
          loginAttempts: 0,
          $unset: { lockUntil: 1 },
          password: hashedPassword
        }
      );
      console.log('✅ Existing admin updated');
    } else {
      // Create new admin
      const hashedPassword = await bcrypt.hash('Admin@123456', 12);
      await User.create({
        name: 'Admin User',
        email: 'admin@ecommerce.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        emailVerified: true
      });
      console.log('✅ New admin user created');
    }

    console.log('\n🎉 Admin credentials:');
    console.log('   Email:    admin@ecommerce.com');
    console.log('   Password: Admin@123456');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
