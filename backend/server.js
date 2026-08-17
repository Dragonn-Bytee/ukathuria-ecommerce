import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import compression from 'compression';
import connectDB from './config/db.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

// Middleware
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import AppError from './utils/appError.js';

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginResourcePolicy: false,
}));

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://ukathuria-ecommerce.vercel.app',
  ...(process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((str) => str.trim())
    : []),
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
      return;
    }

    console.warn(`CORS blocked request from origin: ${origin}`);
    callback(null, false);
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization
app.use(mongoSanitize()); // NoSQL injection protection
app.use(xss()); // XSS protection

// HTTP parameter pollution protection
app.use(hpp({
  whitelist: ['sort', 'fields', 'page', 'limit', 'category', 'brand']
}));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // More lenient in development
  message: {
    status: 'fail',
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Strict rate limiting for auth endpoints (only in production)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window in production
  message: {
    status: 'fail',
    message: 'Too many authentication attempts, please try again later.'
  },
  skipSuccessfulRequests: true,
  skip: () => process.env.NODE_ENV !== 'production', // Skip entirely in development
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Health check endpoint - v2
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Setup admin user and clear account locks
app.all(['/api/setup-admin', '/api/admin/setup'], async (req, res) => {
  try {
    const bcrypt = (await import('bcrypt')).default;
    const User = (await import('./models/User.js')).default;
    
    // Reset all account locks
    await User.updateMany({}, { 
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 0, isActive: true }
    });

    const hashedPassword = await bcrypt.hash('Admin@123456', 12);
    
    const admin = await User.findOneAndUpdate(
      { email: 'admin@ecommerce.com' },
      { 
        name: 'Admin User',
        role: 'admin', 
        isActive: true, 
        loginAttempts: 0,
        emailVerified: true,
        password: hashedPassword,
        $unset: { lockUntil: 1 }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({
      status: 'success',
      message: 'Admin user created/reset. All account locks cleared.',
      credentials: {
        email: 'admin@ecommerce.com',
        password: 'Admin@123456'
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Seed product catalog into MongoDB
app.all(['/api/seed', '/api/seed-products'], async (req, res) => {
  try {
    const { autoSeedDatabase } = await import('./utils/autoSeed.js');
    const force = req.query.force === 'true' || req.body?.force === true;
    const result = await autoSeedDatabase({ force });
    res.json({
      status: 'success',
      message: result.seeded ? 'Database seeded successfully with products catalog!' : 'Database already contains products',
      data: result
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});


// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'E-Commerce API is running',
    version: '1.0.0',
    documentation: '/api-docs'
  });
});

// 404 handler
app.use('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});

export default app;
