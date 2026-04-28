import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import AppError from '../utils/appError.js';

class AuthService {
  // Generate JWT tokens
  generateTokens(userId) {
    const accessToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    const refreshToken = crypto.randomBytes(64).toString('hex');
    
    return { accessToken, refreshToken };
  }

  // Register new user
  async register(userData) {
    const { name, email, password, phone } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('User already exists', 400);
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      emailVerified: false
    });

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(user._id);

    // Save refresh token to database
    await user.addRefreshToken(refreshToken);

    // Remove password from output
    user.password = undefined;

    return {
      user,
      accessToken,
      refreshToken
    };
  }

  // Login user
  async login(email, password) {
    // Find user with password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check if account is locked
    if (user.isLocked) {
      throw new AppError('Account is temporarily locked due to failed login attempts', 423);
    }

    // Check if account is active
    if (!user.isActive) {
      throw new AppError('Account has been deactivated', 401);
    }

    // Verify password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      await user.incLoginAttempts();
      throw new AppError('Invalid email or password', 401);
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(user._id);

    // Save refresh token to database
    await user.addRefreshToken(refreshToken);

    // Remove password from output
    user.password = undefined;

    return {
      user,
      accessToken,
      refreshToken
    };
  }

  // Refresh access token
  async refreshToken(refreshToken) {
    // Find user with this refresh token
    const user = await User.findOne({
      'refreshTokens.token': refreshToken,
      'refreshTokens.expiresAt': { $gt: new Date() }
    });

    if (!user) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(user._id);

    // Remove old refresh token and add new one
    await user.removeRefreshToken(refreshToken);
    await user.addRefreshToken(newRefreshToken);

    return {
      accessToken,
      refreshToken: newRefreshToken
    };
  }

  // Logout user
  async logout(refreshToken) {
    const user = await User.findOne({
      'refreshTokens.token': refreshToken
    });

    if (user) {
      await user.removeRefreshToken(refreshToken);
    }

    return { message: 'Logged out successfully' };
  }

  // Logout from all devices
  async logoutAllDevices(userId) {
    const user = await User.findById(userId);
    if (user) {
      await user.clearRefreshTokens();
    }

    return { message: 'Logged out from all devices successfully' };
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await user.matchPassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Clear all refresh tokens (force re-login on all devices)
    await user.clearRefreshTokens();

    return { message: 'Password changed successfully' };
  }

  // Request password reset
  async requestPasswordReset(email) {
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal that user doesn't exist
      return { message: 'If an account exists, a reset link has been sent' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save reset token to user
    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // In a real application, you would send an email here
    // For now, we'll just return the token (for development)
    return {
      message: 'Password reset token generated',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    };
  }

  // Reset password
  async resetPassword(token, newPassword) {
    // Hash the token to compare with stored hash
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: resetTokenHash,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    // Update password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Clear all refresh tokens
    await user.clearRefreshTokens();

    return { message: 'Password reset successfully' };
  }

  // Verify email
  async verifyEmail(token) {
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new AppError('Invalid or expired verification token', 400);
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return { message: 'Email verified successfully' };
  }
}

export default new AuthService();
