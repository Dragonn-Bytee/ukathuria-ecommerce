import stripe from 'stripe';
import Razorpay from 'razorpay';
import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import AppError from '../utils/appError.js';

// Initialize payment gateways
const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);
const razorpayInstance = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET 
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    })
  : null;

class PaymentService {
  // Create Stripe payment intent
  async createStripePaymentIntent(orderId, amount) {
    try {
      const paymentIntent = await stripeInstance.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          orderId: orderId
        },
        automatic_payment_methods: {
          enabled: true
        }
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      console.error('Stripe payment intent creation error:', error);
      throw new AppError('Failed to create payment intent', 500);
    }
  }

  // Create Razorpay order
  async createRazorpayOrder(orderId, amount) {
    try {
      if (!razorpayInstance) {
        throw new AppError('Razorpay is not configured', 500);
      }

      const options = {
        amount: Math.round(amount * 100), // Convert to paise
        currency: 'INR',
        receipt: orderId,
        notes: {
          orderId: orderId
        }
      };

      const razorpayOrder = await razorpayInstance.orders.create(options);

      return {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID
      };
    } catch (error) {
      console.error('Razorpay order creation error:', error);
      throw new AppError('Failed to create payment order', 500);
    }
  }

  // Process Stripe payment confirmation
  async confirmStripePayment(paymentIntentId) {
    try {
      const paymentIntent = await stripeInstance.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
        const orderId = paymentIntent.metadata.orderId;
        
        // Create payment record
        const payment = await Payment.create({
          order: orderId,
          method: 'stripe',
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency.toUpperCase(),
          status: 'completed',
          gatewayResponse: {
            id: paymentIntent.id,
            status: paymentIntent.status,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            created: paymentIntent.created,
            object: paymentIntent.object,
            raw: paymentIntent
          },
          processedAt: new Date()
        });

        // Update order status
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: 'paid',
          paymentResult: {
            id: paymentIntent.id,
            status: paymentIntent.status,
            gatewayResponse: paymentIntent
          }
        });

        return payment;
      } else {
        throw new AppError('Payment not successful', 400);
      }
    } catch (error) {
      console.error('Stripe payment confirmation error:', error);
      throw new AppError('Failed to confirm payment', 500);
    }
  }

  // Process Razorpay payment confirmation
  async confirmRazorpayPayment(paymentData) {
    try {
      if (!razorpayInstance) {
        throw new AppError('Razorpay is not configured', 500);
      }

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;
      
      // Verify payment signature
      const crypto = require('crypto');
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        throw new AppError('Invalid payment signature', 400);
      }

      // Fetch payment details
      const payment = await razorpayInstance.payments.fetch(razorpay_payment_id);
      
      if (payment.status === 'captured') {
        const orderId = payment.notes.orderId;
        
        // Create payment record
        const paymentRecord = await Payment.create({
          order: orderId,
          method: 'razorpay',
          amount: payment.amount / 100,
          currency: payment.currency,
          status: 'completed',
          gatewayResponse: {
            id: payment.id,
            status: payment.status,
            amount: payment.amount,
            currency: payment.currency,
            raw: payment
          },
          processedAt: new Date()
        });

        // Update order status
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: 'paid',
          paymentResult: {
            id: payment.id,
            status: payment.status,
            gatewayResponse: payment
          }
        });

        return paymentRecord;
      } else {
        throw new AppError('Payment not successful', 400);
      }
    } catch (error) {
      console.error('Razorpay payment confirmation error:', error);
      throw new AppError('Failed to confirm payment', 500);
    }
  }

  // Create payment record for Cash on Delivery
  async createCodPayment(orderId, amount) {
    try {
      const payment = await Payment.create({
        order: orderId,
        method: 'cod',
        amount,
        currency: 'USD',
        status: 'pending',
        processedAt: new Date()
      });

      // Update order status
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'pending'
      });

      return payment;
    } catch (error) {
      console.error('COD payment creation error:', error);
      throw new AppError('Failed to create COD payment', 500);
    }
  }

  // Process refund
  async processRefund(paymentId, amount, reason) {
    try {
      const payment = await Payment.findById(paymentId);
      
      if (!payment) {
        throw new AppError('Payment not found', 404);
      }

      if (payment.method === 'stripe') {
        return await this.processStripeRefund(payment, amount, reason);
      } else if (payment.method === 'razorpay') {
        return await this.processRazorpayRefund(payment, amount, reason);
      } else {
        throw new AppError('Refund not supported for this payment method', 400);
      }
    } catch (error) {
      console.error('Refund processing error:', error);
      throw new AppError('Failed to process refund', 500);
    }
  }

  // Process Stripe refund
  async processStripeRefund(payment, amount, reason) {
    try {
      const refund = await stripeInstance.refunds.create({
        payment_intent: payment.gatewayResponse.id,
        amount: Math.round(amount * 100),
        reason: 'requested_by_customer',
        metadata: {
          reason: reason
        }
      });

      // Add refund to payment record
      await payment.addRefund(amount, reason);
      await payment.processRefund(0, refund);

      return refund;
    } catch (error) {
      console.error('Stripe refund error:', error);
      throw new AppError('Failed to process Stripe refund', 500);
    }
  }

  // Process Razorpay refund
  async processRazorpayRefund(payment, amount, reason) {
    try {
      if (!razorpayInstance) {
        throw new AppError('Razorpay is not configured', 500);
      }

      const refund = await razorpayInstance.payments.refund(payment.gatewayResponse.id, {
        amount: Math.round(amount * 100)
      });

      // Add refund to payment record
      await payment.addRefund(amount, reason);
      await payment.processRefund(0, refund);

      return refund;
    } catch (error) {
      console.error('Razorpay refund error:', error);
      throw new AppError('Failed to process Razorpay refund', 500);
    }
  }

  // Get payment by ID
  async getPayment(paymentId, userId, userRole = 'user') {
    let query = { _id: paymentId };

    // Users can only see their own payments, admins can see all
    if (userRole !== 'admin') {
      query.user = userId;
    }

    const payment = await Payment.findOne(query)
      .populate('order', 'orderNumber user')
      .populate('user', 'name email');

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    return payment;
  }

  // Get user payments
  async getUserPayments(userId, query) {
    const {
      page = 1,
      limit = 10,
      status,
      method,
      sort = '-createdAt'
    } = query;

    // Build query
    const queryObj = { user: userId };

    if (status) {
      queryObj.status = status;
    }

    if (method) {
      queryObj.method = method;
    }

    const payments = await Payment.find(queryObj)
      .populate('order', 'orderNumber')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(queryObj);

    return {
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get all payments (Admin)
  async getAllPayments(query) {
    const {
      page = 1,
      limit = 10,
      status,
      method,
      search,
      sort = '-createdAt'
    } = query;

    // Build query
    const queryObj = {};

    if (status) {
      queryObj.status = status;
    }

    if (method) {
      queryObj.method = method;
    }

    if (search) {
      queryObj.$or = [
        { 'gatewayResponse.id': { $regex: search, $options: 'i' } },
        { 'order.orderNumber': { $regex: search, $options: 'i' } }
      ];
    }

    const payments = await Payment.find(queryObj)
      .populate('order', 'orderNumber user')
      .populate('user', 'name email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(queryObj);

    return {
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Handle Stripe webhook
  async handleStripeWebhook(event) {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.confirmStripePayment(event.data.object.id);
          break;
        case 'payment_intent.payment_failed':
          await this.handleStripePaymentFailure(event.data.object);
          break;
        case 'payment_intent.canceled':
          await this.handleStripePaymentCancellation(event.data.object);
          break;
        default:
          console.log(`Unhandled Stripe event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Stripe webhook error:', error);
      throw new AppError('Webhook processing failed', 500);
    }
  }

  // Handle Razorpay webhook
  async handleRazorpayWebhook(event) {
    try {
      const { event, payload } = JSON.parse(event);

      switch (event) {
        case 'payment.captured':
          await this.confirmRazorpayPayment(payload.payment.entity);
          break;
        case 'payment.failed':
          await this.handleRazorpayPaymentFailure(payload.payment.entity);
          break;
        default:
          console.log(`Unhandled Razorpay event type: ${event}`);
      }
    } catch (error) {
      console.error('Razorpay webhook error:', error);
      throw new AppError('Webhook processing failed', 500);
    }
  }

  // Handle Stripe payment failure
  async handleStripePaymentFailure(paymentIntent) {
    const orderId = paymentIntent.metadata.orderId;
    
    await Payment.create({
      order: orderId,
      method: 'stripe',
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      status: 'failed',
      gatewayResponse: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        raw: paymentIntent
      },
      failureReason: paymentIntent.last_payment_error?.message || 'Payment failed'
    });

    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'failed'
    });
  }

  // Handle Razorpay payment failure
  async handleRazorpayPaymentFailure(payment) {
    const orderId = payment.notes.orderId;
    
    await Payment.create({
      order: orderId,
      method: 'razorpay',
      amount: payment.amount / 100,
      currency: payment.currency,
      status: 'failed',
      gatewayResponse: {
        id: payment.id,
        status: payment.status,
        raw: payment
      },
      failureReason: payment.error?.description || 'Payment failed'
    });

    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'failed'
    });
  }

  // Handle Stripe payment cancellation
  async handleStripePaymentCancellation(paymentIntent) {
    const orderId = paymentIntent.metadata.orderId;
    
    await Payment.create({
      order: orderId,
      method: 'stripe',
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      status: 'failed',
      gatewayResponse: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        raw: paymentIntent
      },
      failureReason: 'Payment cancelled'
    });

    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'failed'
    });
  }
}

export default new PaymentService();
