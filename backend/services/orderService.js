import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import Payment from '../models/Payment.js';
import AppError from '../utils/appError.js';
import cartService from './cartService.js';

class OrderService {
  // Create order from cart
  async createOrder(userId, orderData) {
    const { shippingAddress, billingAddress, paymentMethod, notes } = orderData;

    // Validate cart
    const { isValid, validationResults, cart } = await cartService.validateCartForCheckout(userId);

    if (!isValid) {
      throw new AppError('Cart validation failed', 400, validationResults);
    }

    // Calculate totals
    const itemsPrice = cart.subtotal;
    const taxPrice = itemsPrice * 0.1; // 10% tax
    const shippingPrice = itemsPrice > 100 ? 0 : 10; // Free shipping over $100
    const totalPrice = itemsPrice + taxPrice + shippingPrice;

    // Create order items
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      slug: item.product.slug,
      image: item.product.images[0]?.url || '',
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity
    }));

    // Create order
    const order = await Order.create({
      user: userId,
      orderItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod,
      pricing: {
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
      },
      notes,
      createdBy: userId
    });

    // Update product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { 'inventory.quantity': -item.quantity } }
      );
    }

    // Clear cart
    await cartService.clearCart(userId);

    // Populate order details
    await order.populate([
      { path: 'user', select: 'name email' },
      { path: 'orderItems.product', select: 'name slug' }
    ]);

    return order;
  }

  // Get order by ID
  async getOrder(orderId, userId, userRole = 'user') {
    let query = { _id: orderId };

    // Users can only see their own orders, admins can see all
    if (userRole !== 'admin') {
      query.user = userId;
    }

    const order = await Order.findOne(query)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name slug images');

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    return order;
  }

  // Get user orders
  async getUserOrders(userId, query) {
    const {
      page = 1,
      limit = 10,
      status,
      sort = '-createdAt'
    } = query;

    // Build query
    const queryObj = { user: userId };

    if (status) {
      queryObj.orderStatus = status;
    }

    const orders = await Order.find(queryObj)
      .populate('orderItems.product', 'name slug images')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(queryObj);

    return {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get all orders (Admin)
  async getAllOrders(query) {
    const {
      page = 1,
      limit = 10,
      status,
      paymentStatus,
      search,
      sort = '-createdAt'
    } = query;

    // Build query
    const queryObj = {};

    if (status) {
      queryObj.orderStatus = status;
    }

    if (paymentStatus) {
      queryObj.paymentStatus = paymentStatus;
    }

    if (search) {
      queryObj.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.email': { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(queryObj)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name slug')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(queryObj);

    return {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Update order status (Admin)
  async updateOrderStatus(orderId, status, reason, trackingData) {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Update status
    await order.updateStatus(status, reason);

    // Add tracking information if provided
    if (trackingData && status === 'shipped') {
      order.tracking = {
        trackingNumber: trackingData.trackingNumber,
        carrier: trackingData.carrier,
        status: 'shipped',
        estimatedDelivery: trackingData.estimatedDelivery
      };

      await order.save();
    }

    // Update payment status if order is delivered
    if (status === 'delivered' && order.paymentStatus === 'processing') {
      order.paymentStatus = 'paid';
      await order.save();
    }

    return await Order.findById(orderId)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name slug');
  }

  // Cancel order
  async cancelOrder(orderId, userId, userRole = 'user', reason) {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Check if user can cancel this order
    if (userRole !== 'admin' && order.user.toString() !== userId.toString()) {
      throw new AppError('You can only cancel your own orders', 403);
    }

    // Check if order can be cancelled
    if (!order.canCancel) {
      throw new AppError('This order cannot be cancelled', 400);
    }

    // Update order status
    await order.updateStatus('cancelled', reason);

    // Restore product stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { 'inventory.quantity': item.quantity } }
      );
    }

    // Process refund if payment was made
    if (order.paymentStatus === 'paid') {
      // This would integrate with payment gateway to process refund
      order.paymentStatus = 'refunded';
      await order.save();
    }

    return order;
  }

  // Get dashboard data (Admin)
  async getDashboardData() {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$pricing.totalPrice' } } }
    ]);
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);
    
    const topProducts = await Order.aggregate([
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          totalSold: { $sum: '$orderItems.quantity' },
          revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          name: '$product.name',
          totalSold: 1,
          revenue: 1
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    return {
      overview: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalUsers: 0, // Placeholder - would need User model
        avgOrderValue: totalOrders > 0 ? (totalRevenue[0]?.total || 0) / totalOrders : 0
      },
      recentOrders,
      topProducts
    };
  }
}

export default new OrderService();
