import express from 'express';
import {
  createOrder,
  getOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  addTrackingUpdate,
  cancelOrder,
  returnOrder,
  getDashboardData,
  getOrderStats
} from '../controllers/orderController.js';
import {
  protect,
  restrictTo
} from '../middleware/authMiddleware.js';
import {
  validate,
  createOrderSchema,
  updateOrderStatusSchema
} from '../utils/validators.js';

const router = express.Router();

// Protected routes (all require authentication)
router.use(protect);

// User order routes
router.post('/', validate(createOrderSchema), createOrder);
router.get('/my-orders', getUserOrders);
router.get('/:id', getOrder);
router.post('/:id/cancel', cancelOrder);
router.post('/:id/return', returnOrder);

// Admin routes
router.use(restrictTo('admin')); // All routes below this require admin role

router.get('/', getAllOrders);
router.put('/:id/status', validate(updateOrderStatusSchema), updateOrderStatus);
router.post('/:id/tracking', addTrackingUpdate);
router.get('/dashboard/stats', getDashboardData);
router.get('/stats', getOrderStats);

export default router;
