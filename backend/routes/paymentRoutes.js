import express from 'express';
import {
  createStripePaymentIntent,
  createRazorpayOrder,
  confirmStripePayment,
  confirmRazorpayPayment,
  createCodPayment,
  processRefund,
  getPayment,
  getUserPayments,
  getAllPayments,
  handleStripeWebhook,
  handleRazorpayWebhook
} from '../controllers/paymentController.js';
import {
  protect,
  restrictTo
} from '../middleware/authMiddleware.js';
import {
  validate,
  createPaymentSchema
} from '../utils/validators.js';

const router = express.Router();

// Protected routes (all require authentication)
router.use(protect);

// Payment creation routes
router.post('/stripe/create-intent', validate(createPaymentSchema), createStripePaymentIntent);
router.post('/razorpay/create-order', validate(createPaymentSchema), createRazorpayOrder);
router.post('/cod', validate(createPaymentSchema), createCodPayment);

// Payment confirmation routes
router.post('/stripe/confirm', confirmStripePayment);
router.post('/razorpay/confirm', confirmRazorpayPayment);

// Payment management routes
router.get('/my-payments', getUserPayments);
router.get('/:id', getPayment);

// Admin routes
router.use(restrictTo('admin')); // All routes below this require admin role

router.get('/', getAllPayments);
router.post('/refund', processRefund);

// Webhook routes (no authentication required)
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);
router.post('/razorpay/webhook', handleRazorpayWebhook);

export default router;
