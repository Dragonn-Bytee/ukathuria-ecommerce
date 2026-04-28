import orderService from '../services/orderService.js';
import catchAsync from '../utils/catchAsync.js';

// Create order from cart
export const createOrder = catchAsync(async (req, res) => {
  const order = await orderService.createOrder(req.user._id, req.body);

  res.status(201).json({
    status: 'success',
    message: 'Order created successfully',
    data: {
      order
    }
  });
});

// Get order by ID
export const getOrder = catchAsync(async (req, res) => {
  const order = await orderService.getOrder(
    req.params.id, 
    req.user._id, 
    req.user.role
  );

  res.json({
    status: 'success',
    data: {
      order
    }
  });
});

// Get user orders
export const getUserOrders = catchAsync(async (req, res) => {
  const { orders, pagination } = await orderService.getUserOrders(req.user._id, req.query);

  res.json({
    status: 'success',
    results: orders.length,
    data: {
      orders,
      pagination
    }
  });
});

// Get all orders (Admin)
export const getAllOrders = catchAsync(async (req, res) => {
  const { orders, pagination } = await orderService.getAllOrders(req.query);

  res.json({
    status: 'success',
    results: orders.length,
    data: {
      orders,
      pagination
    }
  });
});

// Update order status (Admin)
export const updateOrderStatus = catchAsync(async (req, res) => {
  const { status, reason, tracking } = req.body;
  const order = await orderService.updateOrderStatus(
    req.params.id,
    status,
    reason,
    tracking
  );

  res.json({
    status: 'success',
    message: 'Order status updated successfully',
    data: {
      order
    }
  });
});

// Add tracking update
export const addTrackingUpdate = catchAsync(async (req, res) => {
  const { status, location, description } = req.body;
  const order = await orderService.addTrackingUpdate(
    req.params.id,
    status,
    location,
    description
  );

  res.json({
    status: 'success',
    message: 'Tracking update added successfully',
    data: {
      order
    }
  });
});

// Cancel order
export const cancelOrder = catchAsync(async (req, res) => {
  const { reason } = req.body;
  const order = await orderService.cancelOrder(
    req.params.id,
    req.user._id,
    req.user.role,
    reason
  );

  res.json({
    status: 'success',
    message: 'Order cancelled successfully',
    data: {
      order
    }
  });
});

// Return order
export const returnOrder = catchAsync(async (req, res) => {
  const { reason } = req.body;
  const order = await orderService.returnOrder(
    req.params.id,
    req.user._id,
    reason
  );

  res.json({
    status: 'success',
    message: 'Order return processed successfully',
    data: {
      order
    }
  });
});

// Get dashboard data (Admin)
export const getDashboardData = catchAsync(async (req, res) => {
  const dashboardData = await orderService.getDashboardData();

  res.json({
    status: 'success',
    data: {
      dashboard: dashboardData
    }
  });
});

// Get order statistics (Admin)
export const getOrderStats = catchAsync(async (req, res) => {
  const stats = await orderService.getOrderStats();

  res.json({
    status: 'success',
    data: {
      stats
    }
  });
});
