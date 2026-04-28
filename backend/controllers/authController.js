import authService from '../services/authService.js';
import catchAsync from '../utils/catchAsync.js';
import User from '../models/User.js';
import AppError from '../utils/appError.js';

// Register new user
export const register = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);

  res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    data: {
      user,
      accessToken,
      refreshToken
    }
  });
});

// Login user
export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.login(email, password);

  res.json({
    status: 'success',
    message: 'Login successful',
    data: {
      user,
      accessToken,
      refreshToken
    }
  });
});

// Refresh access token
export const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refreshToken(refreshToken);

  res.json({
    status: 'success',
    message: 'Token refreshed successfully',
    data: tokens
  });
});

// Logout user
export const logout = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;
  await authService.logout(refreshToken);

  res.json({
    status: 'success',
    message: 'Logged out successfully'
  });
});

// Logout from all devices
export const logoutAll = catchAsync(async (req, res) => {
  await authService.logoutAllDevices(req.user._id);

  res.json({
    status: 'success',
    message: 'Logged out from all devices successfully'
  });
});

// Get current user profile
export const getProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password -refreshTokens -passwordResetToken -passwordResetExpires');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.json({
    status: 'success',
    data: {
      user
    }
  });
});

// Update user profile
export const updateProfile = catchAsync(async (req, res) => {
  const { name, phone, addresses } = req.body;
  
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, addresses },
    { new: true, runValidators: true }
  ).select('-password -refreshTokens');

  res.json({
    status: 'success',
    message: 'Profile updated successfully',
    data: {
      user
    }
  });
});

// Change password
export const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user._id, currentPassword, newPassword);

  res.json({
    status: 'success',
    message: 'Password changed successfully'
  });
});

// Request password reset
export const requestPasswordReset = catchAsync(async (req, res) => {
  const { email } = req.body;
  const result = await authService.requestPasswordReset(email);

  res.json({
    status: 'success',
    message: result.message,
    ...(process.env.NODE_ENV === 'development' && { resetToken: result.resetToken })
  });
});

// Reset password
export const resetPassword = catchAsync(async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  
  await authService.resetPassword(token, newPassword);

  res.json({
    status: 'success',
    message: 'Password reset successfully'
  });
});

// Verify email
export const verifyEmail = catchAsync(async (req, res) => {
  const { token } = req.params;
  await authService.verifyEmail(token);

  res.json({
    status: 'success',
    message: 'Email verified successfully'
  });
});

// Get all users (Admin only)
export const getUsers = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, search, role, isActive } = req.query;
  
  // Build query
  const query = {};
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (role) {
    query.role = role;
  }
  
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  const users = await User.find(query)
    .select('-password -refreshTokens')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(query);

  res.json({
    status: 'success',
    results: users.length,
    data: {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// Get user by ID (Admin only)
export const getUserById = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password -refreshTokens');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.json({
    status: 'success',
    data: {
      user
    }
  });
});

// Update user status (Admin only)
export const updateUserStatus = catchAsync(async (req, res) => {
  const { isActive, role } = req.body;
  
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive, role },
    { new: true, runValidators: true }
  ).select('-password -refreshTokens');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.json({
    status: 'success',
    message: 'User status updated successfully',
    data: {
      user
    }
  });
});

// Delete user (Admin only)
export const deleteUser = catchAsync(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.json({
    status: 'success',
    message: 'User deleted successfully'
  });
});
