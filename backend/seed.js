import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import Product from './models/Product.js';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const sampleProducts = [
  {
    name: 'Premium Wireless Headphones',
    description: 'High-quality wireless headphones with active noise cancellation and 30-hour battery life.',
    shortDescription: 'Premium noise-canceling wireless headphones',
    sku: 'HEADPHONES-001',
    price: 299.99,
    compareAtPrice: 399.99,
    brand: 'SoundTech',
    category: 'Electronics',
    subcategory: 'Audio',
    weight: { value: 250, unit: 'g' },
    dimensions: { length: 20, width: 18, height: 8, unit: 'cm' },
    inventory: {
      quantity: 50,
      lowStockThreshold: 10,
      trackQuantity: true,
      allowBackorder: false
    },
    tags: ['wireless', 'bluetooth', 'noise-canceling', 'premium'],
    featured: true,
    status: 'active',
    seo: {
      title: 'Premium Wireless Headphones - SoundTech',
      description: 'Experience premium sound quality with our wireless headphones featuring active noise cancellation.',
      keywords: ['wireless headphones', 'bluetooth', 'noise canceling', 'audio']
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
        publicId: 'headphones_main',
        alt: 'Premium Wireless Headphones',
        isMain: true
      }
    ]
  },
  {
    name: 'Smart Watch Series X',
    description: 'Advanced smartwatch with health monitoring, GPS tracking, and 7-day battery life.',
    shortDescription: 'Feature-rich smartwatch with health tracking',
    sku: 'WATCH-001',
    price: 199.99,
    compareAtPrice: 249.99,
    brand: 'TechTime',
    category: 'Electronics',
    subcategory: 'Wearables',
    weight: { value: 45, unit: 'g' },
    dimensions: { length: 4.4, width: 3.8, height: 1.1, unit: 'cm' },
    inventory: {
      quantity: 75,
      lowStockThreshold: 15,
      trackQuantity: true,
      allowBackorder: false
    },
    tags: ['smartwatch', 'fitness', 'health', 'gps'],
    featured: true,
    status: 'active',
    seo: {
      title: 'Smart Watch Series X - TechTime',
      description: 'Stay connected and track your health with our advanced smartwatch.',
      keywords: ['smartwatch', 'fitness tracker', 'health monitoring', 'GPS']
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80',
        publicId: 'smartwatch_main',
        alt: 'Smart Watch Series X',
        isMain: true
      }
    ]
  },
  {
    name: 'Professional DSLR Camera',
    description: '24.2MP full-frame DSLR camera with 4K video recording and advanced autofocus system.',
    shortDescription: 'Professional-grade DSLR camera',
    sku: 'CAMERA-001',
    price: 899.99,
    compareAtPrice: 1299.99,
    brand: 'PhotoPro',
    category: 'Electronics',
    subcategory: 'Cameras',
    weight: { value: 650, unit: 'g' },
    dimensions: { length: 15, width: 12, height: 8, unit: 'cm' },
    inventory: {
      quantity: 25,
      lowStockThreshold: 5,
      trackQuantity: true,
      allowBackorder: true
    },
    tags: ['DSLR', 'photography', '4K', 'professional'],
    featured: true,
    status: 'active',
    seo: {
      title: 'Professional DSLR Camera - PhotoPro',
      description: 'Capture stunning photos and videos with our professional DSLR camera.',
      keywords: ['DSLR camera', 'photography', '4K video', 'professional camera']
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
        publicId: 'camera_main',
        alt: 'Professional DSLR Camera',
        isMain: true
      }
    ]
  },
  {
    name: 'Laptop Stand Pro',
    description: 'Adjustable aluminum laptop stand for better ergonomics and improved cooling.',
    shortDescription: 'Ergonomic aluminum laptop stand',
    sku: 'STAND-001',
    price: 49.99,
    brand: 'DeskGear',
    category: 'Accessories',
    subcategory: 'Computer Accessories',
    weight: { value: 800, unit: 'g' },
    dimensions: { length: 25, width: 20, height: 2, unit: 'cm' },
    inventory: {
      quantity: 100,
      lowStockThreshold: 20,
      trackQuantity: true,
      allowBackorder: false
    },
    tags: ['laptop', 'stand', 'ergonomic', 'aluminum'],
    featured: false,
    status: 'active',
    seo: {
      title: 'Laptop Stand Pro - DeskGear',
      description: 'Improve your workspace ergonomics with our adjustable laptop stand.',
      keywords: ['laptop stand', 'ergonomic', 'desk setup', 'aluminum']
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
        publicId: 'laptop_stand',
        alt: 'Laptop Stand Pro',
        isMain: true
      }
    ]
  },
  {
    name: 'Wireless Charging Pad',
    description: 'Fast wireless charging pad compatible with all Qi-enabled devices.',
    shortDescription: 'Fast wireless charging pad',
    sku: 'CHARGER-001',
    price: 29.99,
    brand: 'PowerTech',
    category: 'Accessories',
    subcategory: 'Charging',
    weight: { value: 120, unit: 'g' },
    dimensions: { length: 10, width: 10, height: 1, unit: 'cm' },
    inventory: {
      quantity: 150,
      lowStockThreshold: 30,
      trackQuantity: true,
      allowBackorder: false
    },
    tags: ['wireless', 'charging', 'Qi', 'fast charging'],
    featured: false,
    status: 'active',
    seo: {
      title: 'Wireless Charging Pad - PowerTech',
      description: 'Charge your devices wirelessly with our fast charging pad.',
      keywords: ['wireless charging', 'Qi charger', 'fast charging', 'phone charger']
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80',
        publicId: 'wireless_charger',
        alt: 'Wireless Charging Pad',
        isMain: true
      }
    ]
  },
  {
    name: 'Bluetooth Speaker',
    description: 'Portable waterproof Bluetooth speaker with 360-degree sound and 20-hour battery life.',
    shortDescription: 'Portable waterproof Bluetooth speaker',
    sku: 'SPEAKER-001',
    price: 79.99,
    compareAtPrice: 99.99,
    brand: 'SoundWave',
    category: 'Electronics',
    subcategory: 'Audio',
    weight: { value: 350, unit: 'g' },
    dimensions: { length: 8, width: 8, height: 20, unit: 'cm' },
    inventory: {
      quantity: 60,
      lowStockThreshold: 12,
      trackQuantity: true,
      allowBackorder: false
    },
    tags: ['bluetooth', 'speaker', 'portable', 'waterproof'],
    featured: true,
    status: 'active',
    seo: {
      title: 'Bluetooth Speaker - SoundWave',
      description: 'Enjoy 360-degree sound anywhere with our portable waterproof speaker.',
      keywords: ['bluetooth speaker', 'portable audio', 'waterproof speaker', 'wireless']
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80',
        publicId: 'bluetooth_speaker',
        alt: 'Bluetooth Speaker',
        isMain: true
      }
    ]
  },
  {
    name: 'USB-C Hub Adapter',
    description: '7-in-1 USB-C hub with HDMI, USB 3.0, SD card reader, and power delivery.',
    shortDescription: 'Multi-port USB-C hub adapter',
    sku: 'HUB-001',
    price: 39.99,
    brand: 'ConnectPro',
    category: 'Accessories',
    subcategory: 'Computer Accessories',
    weight: { value: 80, unit: 'g' },
    dimensions: { length: 12, width: 4, height: 2, unit: 'cm' },
    inventory: {
      quantity: 85,
      lowStockThreshold: 17,
      trackQuantity: true,
      allowBackorder: false
    },
    tags: ['USB-C', 'hub', 'adapter', 'HDMI'],
    featured: false,
    status: 'active',
    seo: {
      title: 'USB-C Hub Adapter - ConnectPro',
      description: 'Expand your connectivity with our 7-in-1 USB-C hub adapter.',
      keywords: ['USB-C hub', 'adapter', 'HDMI', 'multi-port']
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
        publicId: 'usb_hub',
        alt: 'USB-C Hub Adapter',
        isMain: true
      }
    ]
  },
  {
    name: 'Gaming Mouse',
    description: 'High-precision gaming mouse with RGB lighting and programmable buttons.',
    shortDescription: 'RGB gaming mouse with programmable buttons',
    sku: 'MOUSE-001',
    price: 59.99,
    compareAtPrice: 79.99,
    brand: 'GameGear',
    category: 'Electronics',
    subcategory: 'Gaming',
    weight: { value: 95, unit: 'g' },
    dimensions: { length: 12, width: 6, height: 4, unit: 'cm' },
    inventory: {
      quantity: 40,
      lowStockThreshold: 8,
      trackQuantity: true,
      allowBackorder: false
    },
    tags: ['gaming', 'mouse', 'RGB', 'programmable'],
    featured: false,
    status: 'active',
    seo: {
      title: 'Gaming Mouse - GameGear',
      description: 'Enhance your gaming experience with our high-precision RGB gaming mouse.',
      keywords: ['gaming mouse', 'RGB', 'programmable buttons', 'gaming gear']
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1615664695073-75f2980c4151?w=800&q=80',
        publicId: 'gaming_mouse',
        alt: 'Gaming Mouse',
        isMain: true
      }
    ]
  }
];

const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@ecommerce.com',
    password: 'admin123',
    role: 'admin',
    phone: '+1 (555) 123-4567',
    isActive: true,
    emailVerified: true
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'user',
    phone: '+1 (555) 987-6543',
    isActive: true,
    emailVerified: true
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    role: 'user',
    phone: '+1 (555) 456-7890',
    isActive: true,
    emailVerified: true
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Product.deleteMany({});
    await User.deleteMany({});

    // Create users
    console.log('Creating users...');
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${userData.email}`);
    }

    // Create products
    console.log('Creating products...');
    for (const productData of sampleProducts) {
      const product = new Product(productData);
      await product.save();
      console.log(`Created product: ${productData.name}`);
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
