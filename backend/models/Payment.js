import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Order'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
    uppercase: true
  },
  method: {
    type: String,
    required: true,
    enum: ['stripe', 'razorpay', 'paypal', 'cod']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  gatewayResponse: {
    id: String,
    status: String,
    amount: Number,
    currency: String,
    created: Number,
    object: String,
    raw: mongoose.Schema.Types.Mixed // Store raw response from gateway
  },
  webhookData: {
    received: Boolean,
    processed: Boolean,
    data: mongoose.Schema.Types.Mixed
  },
  refunds: [{
    amount: Number,
    reason: String,
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed'],
      default: 'pending'
    },
    gatewayResponse: mongoose.Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now },
    processedAt: Date
  }],
  failureReason: String,
  processedAt: Date,
  expiresAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
paymentSchema.index({ order: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ method: 1 });
paymentSchema.index({ 'gatewayResponse.id': 1 });
paymentSchema.index({ expiresAt: 1 });

// Virtual for refund amount
paymentSchema.virtual('refundedAmount').get(function() {
  return this.refunds.reduce((total, refund) => {
    return refund.status === 'succeeded' ? total + refund.amount : total;
  }, 0);
});

// Virtual for net amount
paymentSchema.virtual('netAmount').get(function() {
  return this.amount - this.refundedAmount;
});

// Method to mark payment as completed
paymentSchema.methods.markCompleted = function(gatewayResponse) {
  this.status = 'completed';
  this.gatewayResponse = gatewayResponse;
  this.processedAt = new Date();
  return this.save();
};

// Method to mark payment as failed
paymentSchema.methods.markFailed = function(reason, gatewayResponse) {
  this.status = 'failed';
  this.failureReason = reason;
  this.gatewayResponse = gatewayResponse;
  return this.save();
};

// Method to add refund
paymentSchema.methods.addRefund = function(amount, reason) {
  if (amount > this.netAmount) {
    throw new Error('Refund amount cannot exceed net payment amount');
  }

  this.refunds.push({
    amount,
    reason,
    status: 'pending'
  });

  // Update payment status if fully refunded
  if (this.netAmount - amount <= 0) {
    this.status = 'refunded';
  } else if (amount > 0) {
    this.status = 'partially_refunded';
  }

  return this.save();
};

// Method to process refund
paymentSchema.methods.processRefund = function(refundIndex, gatewayResponse) {
  if (refundIndex >= this.refunds.length) {
    throw new Error('Invalid refund index');
  }

  this.refunds[refundIndex].status = 'succeeded';
  this.refunds[refundIndex].gatewayResponse = gatewayResponse;
  this.refunds[refundIndex].processedAt = new Date();

  // Update payment status
  const totalRefunded = this.refunds.reduce((total, refund) => {
    return refund.status === 'succeeded' ? total + refund.amount : total;
  }, 0);

  if (totalRefunded >= this.amount) {
    this.status = 'refunded';
  } else if (totalRefunded > 0) {
    this.status = 'partially_refunded';
  }

  return this.save();
};

// Method to check if payment is expired
paymentSchema.methods.isExpired = function() {
  return this.expiresAt && this.expiresAt < new Date();
};

// Pre-save middleware to set expiration
paymentSchema.pre('save', function(next) {
  if (this.isNew && this.method !== 'cod') {
    // Set expiration for 30 minutes from creation
    this.expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  }
  next();
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
