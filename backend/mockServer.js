import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mockService from './services/mockService.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('dev'));

// Mock authentication middleware
const mockAuth = (req, res, next) => {
  // For demo purposes, we'll simulate authentication
  // In a real app, you'd verify JWT tokens
  req.user = { _id: 'user1', email: 'john@example.com', role: 'user' };
  next();
};

const mockAdminAuth = (req, res, next) => {
  req.user = { _id: 'admin1', email: 'admin@ecommerce.com', role: 'admin' };
  next();
};

// Routes

// Products
app.get('/api/products', async (req, res) => {
  try {
    const result = await mockService.getProducts(req.query);
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

app.get('/api/products/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const products = await mockService.getFeaturedProducts(limit);
    res.json({
      status: 'success',
      data: { products }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

app.get('/api/products/categories', async (req, res) => {
  try {
    const categories = await mockService.getCategories();
    res.json({
      status: 'success',
      data: { categories }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

app.get('/api/products/brands', async (req, res) => {
  try {
    const brands = await mockService.getBrands();
    res.json({
      status: 'success',
      data: { brands }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await mockService.getProduct(req.params.id);
    res.json({
      status: 'success',
      data: { product }
    });
  } catch (error) {
    res.status(404).json({
      status: 'error',
      message: error.message
    });
  }
});

app.post('/api/products/:id/reviews', async (req, res) => {
  try {
    const review = await mockService.createProductReview(req.params.id, req.body);
    res.json({
      status: 'success',
      data: { review }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Cart
app.get('/api/cart', async (req, res) => {
  try {
    const cart = await mockService.getCart('user1');
    res.json({
      status: 'success',
      data: { cart }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

app.post('/api/cart', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await mockService.addToCart('user1', productId, quantity);
    res.json({
      status: 'success',
      data: { cart }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

app.put('/api/cart/:productId', async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await mockService.updateCartItem('user1', req.params.productId, quantity);
    res.json({
      status: 'success',
      data: { cart }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

app.delete('/api/cart/:productId', async (req, res) => {
  try {
    const cart = await mockService.removeFromCart('user1', req.params.productId);
    res.json({
      status: 'success',
      data: { cart }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

app.delete('/api/cart', async (req, res) => {
  try {
    const cart = await mockService.clearCart('user1');
    res.json({
      status: 'success',
      data: { cart }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Auth
app.post('/api/auth/register', async (req, res) => {
  try {
    const user = await mockService.registerUser(req.body);
    res.status(201).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const user = await mockService.authenticateUser(req.body.email, req.body.password);
    res.json({
      status: 'success',
      data: {
        user,
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token'
      }
    });
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: error.message
    });
  }
});

app.get('/api/auth/profile', mockAuth, async (req, res) => {
  try {
    const user = await mockService.getUserById(req.user._id);
    res.json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    res.status(404).json({
      status: 'error',
      message: error.message
    });
  }
});

// Orders
app.post('/api/orders', mockAuth, async (req, res) => {
  try {
    const order = await mockService.createOrder({
      ...req.body,
      user: req.user._id
    });
    res.status(201).json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

app.get('/api/orders', mockAuth, async (req, res) => {
  try {
    const orders = await mockService.getOrders(req.user._id);
    res.json({
      status: 'success',
      data: { orders }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

app.get('/api/orders/:id', mockAuth, async (req, res) => {
  try {
    const order = await mockService.getOrderById(req.params.id);
    res.json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    res.status(404).json({
      status: 'error',
      message: error.message
    });
  }
});

// Admin routes
app.get('/api/admin/orders', mockAdminAuth, async (req, res) => {
  try {
    const orders = await mockService.getAllOrders();
    res.json({
      status: 'success',
      data: { orders }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Mock Server running in development mode on port ${PORT}`);
  console.log(`📱 Frontend should connect to: http://localhost:${PORT}/api`);
  console.log('👤 Demo users:');
  console.log('   Admin: admin@ecommerce.com / admin123');
  console.log('   User: john@example.com / password123');
  console.log('   User: jane@example.com / password123');
});

export default app;
