import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/appError.js';

// Protect routes - verify access token
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      const user = await User.findById(decoded.userId).select('-password');

      if (!user) {
        return next(new AppError('The user belonging to this token no longer exists', 401));
      }

      // Check if user is active
      if (!user.isActive) {
        return next(new AppError('User account has been deactivated', 401));
      }

      // Check if user is locked
      if (user.isLocked) {
        return next(new AppError('Account is temporarily locked', 423));
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return next(new AppError('Invalid token', 401));
      } else if (error.name === 'TokenExpiredError') {
        return next(new AppError('Token expired', 401));
      }
      return next(new AppError('Not authorized, token failed', 401));
    }
  }

  if (!token) {
    return next(new AppError('Not authorized, no token', 401));
  }
};

// Verify refresh token
export const verifyRefreshToken = async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError('Refresh token is required', 400));
  }

  try {
    // Find user with this refresh token
    const user = await User.findOne({
      'refreshTokens.token': refreshToken,
      'refreshTokens.expiresAt': { $gt: new Date() }
    });

    if (!user) {
      return next(new AppError('Invalid or expired refresh token', 401));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(new AppError('User account has been deactivated', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new AppError('Invalid refresh token', 401));
  }
};

// Restrict to specific roles
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

// Admin middleware (deprecated - use restrictTo instead)
export const admin = restrictTo('admin');

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive && !user.isLocked) {
        req.user = user;
      }
    } catch (error) {
      // Ignore errors for optional auth
    }
  }

  next();
};

// Check if user owns the resource or is admin
export const checkOwnershipOrAdmin = (resourceField = 'user') => {
  return (req, res, next) => {
    const resourceUserId = req.params.userId || req.body[resourceField] || req.resource?.[resourceField];
    
    if (req.user.role === 'admin' || req.user._id.toString() === resourceUserId?.toString()) {
      return next();
    }
    
    return next(new AppError('You can only access your own resources', 403));
  };
};

// Rate limiting for sensitive operations
export const sensitiveOperationLimiter = (req, res, next) => {
  // Add rate limiting logic here if needed
  // For now, just pass through
  next();
};
