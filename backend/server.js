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
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',').map(str => str.trim())
      : ['http://localhost:3000', 'http://localhost:5173'];
      
    // Always include the production frontend URL
    if (!allowedOrigins.includes('https://ukathuria-ecommerce.vercel.app')) {
      allowedOrigins.push('https://ukathuria-ecommerce.vercel.app');
    }
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
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

// Dev-only: Setup admin user and clear rate limits/locks
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/setup-admin', async (req, res) => {
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

  // Dev-only: Seed 55 products
  app.get('/api/seed-products', async (req, res) => {
    try {
      const Product = (await import('./models/Product.js')).default;
      const User    = (await import('./models/User.js')).default;
      const admin   = await User.findOne({ role: 'admin' });
      if (!admin) return res.status(400).json({ status: 'error', message: 'Run /api/setup-admin first' });

      const uid = admin._id;
      const ts  = () => Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2,5).toUpperCase();

      const img = (kw) => `https://source.unsplash.com/600x500/?${encodeURIComponent(kw)}&sig=${Math.random()}`;

      const products = [
        // Electronics
        { name:'AirPods Pro Max',          category:'electronics', brand:'Apple',     price:549, description:'Premium over-ear headphones with spatial audio and ANC.',    images:[{url:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80'}] },
        { name:'Sony WH-1000XM5',          category:'electronics', brand:'Sony',      price:349, description:'Industry-leading noise cancelling wireless headphones.',      images:[{url:'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80'}] },
        { name:'Samsung Galaxy S24 Ultra', category:'electronics', brand:'Samsung',   price:1299,description:'Flagship Android phone with 200MP camera and S Pen.',        images:[{url:'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80'}] },
        { name:'iPad Pro 12.9"',           category:'electronics', brand:'Apple',     price:1099,description:'M2 chip, Liquid Retina XDR display, Thunderbolt connectivity.',images:[{url:'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80'}] },
        { name:'MacBook Air M3',           category:'electronics', brand:'Apple',     price:1299,description:'Impossibly thin laptop with all-day battery and M3 chip.',    images:[{url:'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80'}] },
        { name:'Dell XPS 15',             category:'electronics', brand:'Dell',      price:1899,description:'15.6" OLED display, Core i9, premium build quality.',         images:[{url:'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80'}] },
        { name:'LG 27" 4K Monitor',       category:'electronics', brand:'LG',        price:449, description:'IPS 4K UHD monitor with HDR600 and USB-C connectivity.',      images:[{url:'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80'}] },
        { name:'Logitech MX Master 3',    category:'electronics', brand:'Logitech',  price:99,  description:'Advanced wireless mouse for power users with ergonomic design.',images:[{url:'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&q=80'}] },
        { name:'Keychron K2 Keyboard',    category:'electronics', brand:'Keychron',  price:89,  description:'Wireless mechanical keyboard with RGB and hot-swap switches.',  images:[{url:'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80'}] },
        { name:'GoPro Hero 12',           category:'electronics', brand:'GoPro',     price:399, description:'5.3K60 video, HyperSmooth 6.0, waterproof action camera.',     images:[{url:'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80'}] },
        { name:'Nintendo Switch OLED',    category:'electronics', brand:'Nintendo',  price:349, description:'7" OLED screen, enhanced audio, 64GB storage.',               images:[{url:'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80'}] },
        { name:'Bose SoundLink Max',      category:'electronics', brand:'Bose',      price:399, description:'Portable Bluetooth speaker with 20-hour battery life.',        images:[{url:'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80'}] },
        { name:'Apple Watch Ultra 2',     category:'electronics', brand:'Apple',     price:799, description:'Rugged titanium case, dual-frequency GPS, 60-hour battery.',   images:[{url:'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80'}] },
        { name:'Garmin Forerunner 965',   category:'electronics', brand:'Garmin',    price:599, description:'Premium running smartwatch with AMOLED display and maps.',     images:[{url:'https://images.unsplash.com/photo-1523475496153-3206d90cbef0?w=600&q=80'}] },
        { name:'Anker 65W GaN Charger',   category:'electronics', brand:'Anker',     price:49,  description:'Compact 3-port fast charger for all your devices.',            images:[{url:'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&q=80'}] },
        { name:'Kindle Paperwhite',       category:'electronics', brand:'Amazon',    price:139, description:'Thinner, lighter Kindle with 6.8" display and 10-week battery.',images:[{url:'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80'}] },
        // Apparel
        { name:'Classic White Tee',       category:'apparel', brand:'AURA',         price:29,  description:'Premium 100% Pima cotton essential crew-neck t-shirt.',         images:[{url:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80'}] },
        { name:'Slim Fit Chinos',         category:'apparel', brand:'Minimalist Co.',price:79,  description:'Tailored slim fit chinos in stretch cotton blend.',              images:[{url:'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80'}] },
        { name:'Merino Wool Sweater',     category:'apparel', brand:'AURA',         price:129, description:'Soft 100% merino wool crew-neck sweater for all seasons.',       images:[{url:'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80'}] },
        { name:'Leather Biker Jacket',    category:'apparel', brand:'Minimalist Co.',price:299, description:'Genuine leather moto jacket with asymmetric zip and snap collar.',images:[{url:'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80'}] },
        { name:'Linen Shirt',             category:'apparel', brand:'AURA',         price:59,  description:'Breathable 100% linen shirt, perfect for warm weather styling.', images:[{url:'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80'}] },
        { name:'Relaxed Denim Jeans',     category:'apparel', brand:'Denim Lab',    price:99,  description:'Mid-rise relaxed fit selvedge denim, raw indigo wash.',          images:[{url:'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80'}] },
        { name:'Fleece Hoodie',           category:'apparel', brand:'AURA',         price:69,  description:'Heavyweight French terry fleece pullover hoodie.',              images:[{url:'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80'}] },
        { name:'Oxford Button-Down',      category:'apparel', brand:'Minimalist Co.',price:89,  description:'Classic Oxford weave button-down shirt in 100% cotton.',        images:[{url:'https://images.unsplash.com/photo-1603251578711-3290ca1a0187?w=600&q=80'}] },
        { name:'Cargo Shorts',            category:'apparel', brand:'Denim Lab',    price:55,  description:'Utility cargo shorts with 6 pockets and ripstop nylon fabric.', images:[{url:'https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=600&q=80'}] },
        { name:'Trench Coat',             category:'apparel', brand:'AURA',         price:349, description:'Classic double-breasted trench coat in water-repellent cotton.',  images:[{url:'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=80'}] },
        { name:'Athletic Joggers',        category:'apparel', brand:'SportPro',     price:65,  description:'4-way stretch performance joggers with tapered fit.',            images:[{url:'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80'}] },
        { name:'Polo Shirt',              category:'apparel', brand:'Minimalist Co.',price:75,  description:'Pique cotton polo shirt with contrast tipping on collar and cuffs.',images:[{url:'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80'}] },
        { name:'Bomber Jacket',           category:'apparel', brand:'AURA',         price:199, description:'Satin bomber jacket with ribbed cuffs, collar, and hem.',        images:[{url:'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=600&q=80'}] },
        // Accessories
        { name:'Leather Bifold Wallet',   category:'accessories', brand:'AURA',     price:89,  description:'Full-grain leather slim bifold wallet with RFID blocking.',      images:[{url:'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80'}] },
        { name:'Canvas Tote Bag',         category:'accessories', brand:'Minimalist Co.',price:45,description:'Heavy-duty waxed canvas tote with leather handles.',           images:[{url:'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80'}] },
        { name:'Aviator Sunglasses',      category:'accessories', brand:'OptixPro',  price:149, description:'Classic metal aviator sunglasses with UV400 polarized lenses.',  images:[{url:'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80'}] },
        { name:'Leather Belt',            category:'accessories', brand:'AURA',     price:69,  description:'Full-grain leather reversible belt, black and tan sides.',        images:[{url:'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600&q=80'}] },
        { name:'Wool Beanie',             category:'accessories', brand:'AURA',     price:35,  description:'100% merino wool rib-knit beanie in a relaxed slouchy fit.',     images:[{url:'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600&q=80'}] },
        { name:'Silk Pocket Square',      category:'accessories', brand:'Minimalist Co.',price:29,description:'100% silk pocket square with hand-rolled edges.',             images:[{url:'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80'}] },
        { name:'Leather Backpack',        category:'accessories', brand:'AURA',     price:229, description:'Full-grain leather rucksack with 15" laptop compartment.',       images:[{url:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80'}] },
        { name:'Minimalist Watch',        category:'accessories', brand:'Nordgreen', price:195, description:'Danish-designed watch with sapphire crystal and mesh strap.',    images:[{url:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'}] },
        { name:'Cashmere Scarf',          category:'accessories', brand:'AURA',     price:119, description:'Pure Scottish cashmere scarf, hand-finished fringe detailing.',   images:[{url:'https://images.unsplash.com/photo-1601924351433-3d7526065dbd?w=600&q=80'}] },
        { name:'Weekender Bag',           category:'accessories', brand:'AURA',     price:189, description:'Waxed canvas weekender bag with leather trim and shoe pocket.', images:[{url:'https://images.unsplash.com/photo-1473188588951-666fce8e7c68?w=600&q=80'}] },
        { name:'Leather Card Holder',     category:'accessories', brand:'Minimalist Co.',price:49,description:'Ultra-slim genuine leather card holder with 6 card slots.',   images:[{url:'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80'}] },
        // Footwear
        { name:'White Leather Sneakers',  category:'footwear', brand:'AURA',        price:149, description:'Clean minimal white leather low-top sneakers with cupsole.',     images:[{url:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'}] },
        { name:'Chelsea Boots',           category:'footwear', brand:'Minimalist Co.',price:249,description:'Suede Chelsea boots with elastic side panels and stacked heel.', images:[{url:'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&q=80'}] },
        { name:'Running Shoes',           category:'footwear', brand:'SportPro',     price:129, description:'Lightweight mesh runners with foam midsole and rubber outsole.',  images:[{url:'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&q=80'}] },
        { name:'Desert Boots',            category:'footwear', brand:'AURA',        price:179, description:'Natural suede crepe sole desert boots, classic Clarks silhouette.',images:[{url:'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600&q=80'}] },
        { name:'Loafers',                 category:'footwear', brand:'Minimalist Co.',price:199,description:'Hand-sewn leather penny loafers with leather sole.',             images:[{url:'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&q=80'}] },
        { name:'High-Top Sneakers',       category:'footwear', brand:'Denim Lab',   price:109, description:'Canvas high-top sneakers with vulcanized rubber sole.',          images:[{url:'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=600&q=80'}] },
        { name:'Sandals',                 category:'footwear', brand:'AURA',        price:79,  description:'Full-grain leather sandals with adjustable straps and cork footbed.',images:[{url:'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&q=80'}] },
        // Home
        { name:'Linen Duvet Cover',       category:'home', brand:'AURA Home',      price:149, description:'100% stonewashed linen duvet cover set in natural oatmeal tones.',images:[{url:'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80'}] },
        { name:'Scented Candle Set',      category:'home', brand:'Luminary',       price:65,  description:'Set of 3 soy wax candles: cedar, sandalwood and vetiver scents.', images:[{url:'https://images.unsplash.com/photo-1603905185787-4cd35d75a275?w=600&q=80'}] },
        { name:'Ceramic Pour-Over Set',   category:'home', brand:'AURA Home',      price:89,  description:'Hand-thrown ceramic pour-over coffee dripper with matching mug.', images:[{url:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80'}] },
        { name:'Wooden Cutting Board',    category:'home', brand:'Craft+',         price:79,  description:'End-grain acacia hardwood cutting board with juice groove.',      images:[{url:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'}] },
        { name:'Merino Throw Blanket',    category:'home', brand:'AURA Home',      price:119, description:'100% New Zealand merino wool throw blanket, 130x180cm.',         images:[{url:'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=600&q=80'}] },
        { name:'Stainless Steel Bottle',  category:'home', brand:'HydroFlask',     price:49,  description:'32oz double-wall vacuum insulated water bottle.',                images:[{url:'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80'}] },
        { name:'Cast Iron Skillet',       category:'home', brand:'Craft+',         price:89,  description:'Pre-seasoned 12" cast iron skillet for stovetop and oven.',       images:[{url:'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80'}] },
        { name:'Bamboo Desk Organizer',   category:'home', brand:'AURA Home',      price:55,  description:'5-piece bamboo desk organizer set with pen holder and trays.',    images:[{url:'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&q=80'}] },
      ];

      let created = 0;
      for (const p of products) {
        const exists = await Product.findOne({ name: p.name });
        if (!exists) {
          await Product.create({
            ...p,
            sku: ts(),
            status: 'active',
            featured: Math.random() > 0.7,
            rating: +(4 + Math.random()).toFixed(1),
            inventory: { quantity: Math.floor(Math.random() * 200) + 10, trackQuantity: true },
            createdBy: uid,
          });
          created++;
        }
      }

      res.json({ status: 'success', message: `${created} products seeded (${products.length - created} already existed)` });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  });
}

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
