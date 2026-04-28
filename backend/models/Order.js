import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
});

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product'
  },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true, min: 0 }
}, { _id: false });

const trackingSchema = new mongoose.Schema({
  trackingNumber: String,
  carrier: String,
  status: String,
  estimatedDelivery: Date,
  actualDelivery: Date,
  updates: [{
    status: String,
    location: String,
    timestamp: Date,
    description: String
  }]
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  orderItems: [orderItemSchema],
  shippingAddress: addressSchema,
  billingAddress: addressSchema,
  paymentMethod: {
    type: String,
    required: true,
    enum: ['stripe', 'razorpay', 'paypal', 'cod']
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String,
    gatewayResponse: mongoose.Schema.Types.Mixed
  },
  orderStatus: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  tracking: trackingSchema,
  pricing: {
    itemsPrice: { type: Number, required: true, default: 0.0, min: 0 },
    taxPrice: { type: Number, required: true, default: 0.0, min: 0 },
    shippingPrice: { type: Number, required: true, default: 0.0, min: 0 },
    discountAmount: { type: Number, default: 0.0, min: 0 },
    totalPrice: { type: Number, required: true, default: 0.0, min: 0 }
  },
  discounts: [{
    code: String,
    amount: Number,
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'fixed'
    }
  }],
  notes: {
    customer: String,
    internal: String
  },
  fulfillment: {
    warehouse: String,
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal'
    },
    estimatedDelivery: Date,
    actualDelivery: Date
  },
  timestamps: {
    confirmed: Date,
    processed: Date,
    shipped: Date,
    delivered: Date,
    cancelled: Date,
    returned: Date
  },
  cancellationReason: String,
  returnReason: String,
  refundAmount: { type: Number, default: 0 },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
orderSchema.index({ user: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'timestamps.delivered': -1 });
orderSchema.index({ 'tracking.trackingNumber': 1 });

// Virtual for checking if order is paid
orderSchema.virtual('isPaid').get(function() {
  return this.paymentStatus === 'paid';
});

// Virtual for checking if order is delivered
orderSchema.virtual('isDelivered').get(function() {
  return this.orderStatus === 'delivered';
});

// Virtual for checking if order can be cancelled
orderSchema.virtual('canCancel').get(function() {
  return ['pending', 'confirmed'].includes(this.orderStatus);
});

// Virtual for checking if order can be returned
orderSchema.virtual('canReturn').get(function() {
  return this.orderStatus === 'delivered' && this.isPaid;
});

// Pre-save middleware to generate order number
orderSchema.pre('save', function(next) {
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.orderNumber = `ORD-${year}${month}${day}-${random}`;
  }
  next();
});

// Pre-save middleware to calculate totals
orderSchema.pre('save', function(next) {
  if (this.isModified('orderItems')) {
    // Calculate items price
    this.pricing.itemsPrice = this.orderItems.reduce(
      (total, item) => total + item.subtotal, 0
    );
    
    // Calculate total price
    this.pricing.totalPrice = 
      this.pricing.itemsPrice + 
      this.pricing.taxPrice + 
      this.pricing.shippingPrice - 
      this.pricing.discountAmount;
  }
  next();
});

// Method to update order status
orderSchema.methods.updateStatus = function(newStatus, reason) {
  const validTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered', 'returned'],
    delivered: ['returned'],
    cancelled: [],
    returned: []
  };

  if (!validTransitions[this.orderStatus].includes(newStatus)) {
    throw new Error(`Cannot transition from ${this.orderStatus} to ${newStatus}`);
  }

  this.orderStatus = newStatus;
  
  // Update timestamps
  const now = new Date();
  switch (newStatus) {
    case 'confirmed':
      this.timestamps.confirmed = now;
      break;
    case 'processing':
      this.timestamps.processed = now;
      break;
    case 'shipped':
      this.timestamps.shipped = now;
      break;
    case 'delivered':
      this.timestamps.delivered = now;
      this.fulfillment.actualDelivery = now;
      break;
    case 'cancelled':
      this.timestamps.cancelled = now;
      this.cancellationReason = reason;
      break;
    case 'returned':
      this.timestamps.returned = now;
      this.returnReason = reason;
      break;
  }

  return this.save();
};

// Method to add tracking update
orderSchema.methods.addTrackingUpdate = function(status, location, description) {
  if (!this.tracking.updates) {
    this.tracking.updates = [];
  }
  
  this.tracking.updates.push({
    status,
    location,
    timestamp: new Date(),
    description
  });

  return this.save();
};

const Order = mongoose.model('Order', orderSchema);
export default Order;
