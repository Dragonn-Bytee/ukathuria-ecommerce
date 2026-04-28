import paymentService from '../services/paymentService.js';
import catchAsync from '../utils/catchAsync.js';

// Create Stripe payment intent
export const createStripePaymentIntent = catchAsync(async (req, res) => {
  const { orderId, amount } = req.body;
  
  const paymentIntent = await paymentService.createStripePaymentIntent(orderId, amount);

  res.json({
    status: 'success',
    message: 'Payment intent created successfully',
    data: {
      paymentIntent
    }
  });
});

// Create Razorpay order
export const createRazorpayOrder = catchAsync(async (req, res) => {
  const { orderId, amount } = req.body;
  
  const razorpayOrder = await paymentService.createRazorpayOrder(orderId, amount);

  res.json({
    status: 'success',
    message: 'Razorpay order created successfully',
    data: {
      order: razorpayOrder
    }
  });
});

// Confirm Stripe payment
export const confirmStripePayment = catchAsync(async (req, res) => {
  const { paymentIntentId } = req.body;
  
  const payment = await paymentService.confirmStripePayment(paymentIntentId);

  res.json({
    status: 'success',
    message: 'Payment confirmed successfully',
    data: {
      payment
    }
  });
});

// Confirm Razorpay payment
export const confirmRazorpayPayment = catchAsync(async (req, res) => {
  const paymentData = req.body;
  
  const payment = await paymentService.confirmRazorpayPayment(paymentData);

  res.json({
    status: 'success',
    message: 'Payment confirmed successfully',
    data: {
      payment
    }
  });
});

// Create COD payment
export const createCodPayment = catchAsync(async (req, res) => {
  const { orderId, amount } = req.body;
  
  const payment = await paymentService.createCodPayment(orderId, amount);

  res.json({
    status: 'success',
    message: 'COD payment created successfully',
    data: {
      payment
    }
  });
});

// Process refund
export const processRefund = catchAsync(async (req, res) => {
  const { paymentId, amount, reason } = req.body;
  
  const refund = await paymentService.processRefund(paymentId, amount, reason);

  res.json({
    status: 'success',
    message: 'Refund processed successfully',
    data: {
      refund
    }
  });
});

// Get payment by ID
export const getPayment = catchAsync(async (req, res) => {
  const payment = await paymentService.getPayment(
    req.params.id,
    req.user._id,
    req.user.role
  );

  res.json({
    status: 'success',
    data: {
      payment
    }
  });
});

// Get user payments
export const getUserPayments = catchAsync(async (req, res) => {
  const { payments, pagination } = await paymentService.getUserPayments(req.user._id, req.query);

  res.json({
    status: 'success',
    results: payments.length,
    data: {
      payments,
      pagination
    }
  });
});

// Get all payments (Admin)
export const getAllPayments = catchAsync(async (req, res) => {
  const { payments, pagination } = await paymentService.getAllPayments(req.query);

  res.json({
    status: 'success',
    results: payments.length,
    data: {
      payments,
      pagination
    }
  });
});

// Handle Stripe webhook
export const handleStripeWebhook = catchAsync(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  await paymentService.handleStripeWebhook(event);

  res.json({ received: true });
});

// Handle Razorpay webhook
export const handleRazorpayWebhook = catchAsync(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  
  // Verify webhook signature (implementation depends on your security requirements)
  await paymentService.handleRazorpayWebhook(req.body);

  res.json({ status: 'success' });
});
