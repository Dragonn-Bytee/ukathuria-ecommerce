import express from 'express';
import Joi from 'joi';
import {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
  getProfile,
  updateProfile,
  changePassword,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  getUsers,
  getUserById,
  updateUserStatus,
  deleteUser
} from '../controllers/authController.js';
import {
  protect,
  verifyRefreshToken,
  restrictTo,
  checkOwnershipOrAdmin
} from '../middleware/authMiddleware.js';
import {
  validate,
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateProfileSchema,
  updateUserStatusSchema
} from '../utils/validators.js';

const router = express.Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh-token', validate({ refreshToken: Joi.string().required() }), refreshToken);
router.post('/logout', logout);
router.post('/request-password-reset', validate({ email: Joi.string().email().required() }), requestPasswordReset);
router.post('/reset-password/:token', validate({ newPassword: Joi.string().min(6).required() }), resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Protected routes
router.use(protect); // All routes below this require authentication

// User profile routes
router.get('/profile', getProfile);
router.put('/profile', validate(updateProfileSchema), updateProfile);
router.put('/change-password', validate(changePasswordSchema), changePassword);
router.post('/logout-all', logoutAll);

// Admin routes
router.use(restrictTo('admin')); // All routes below this require admin role

router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id/status', validate(updateUserStatusSchema), updateUserStatus);
router.delete('/:id', deleteUser);

export default router;
