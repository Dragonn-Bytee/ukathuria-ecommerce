// Mock data for testing without MongoDB
export const mockProducts = [
  {
    _id: '1',
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
    rating: 4.5,
    numReviews: 128,
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
    ],
    reviews: [
      {
        _id: 'r1',
        user: { name: 'John Doe' },
        rating: 5,
        title: 'Amazing sound quality!',
        comment: 'Best headphones I have ever owned. The noise cancellation is incredible.',
        createdAt: new Date('2024-01-15')
      }
    ],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-15')
  },
  {
    _id: '2',
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
    rating: 4.3,
    numReviews: 89,
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
    ],
    reviews: [
      {
        _id: 'r2',
        user: { name: 'Jane Smith' },
        rating: 4,
        title: 'Great smartwatch',
        comment: 'Love the features and battery life. Very accurate health tracking.',
        createdAt: new Date('2024-01-12')
      }
    ],
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-14')
  },
  {
    _id: '3',
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
    rating: 4.7,
    numReviews: 56,
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
    ],
    reviews: [
      {
        _id: 'r3',
        user: { name: 'Mike Johnson' },
        rating: 5,
        title: 'Professional quality',
        comment: 'Amazing camera for professional photography. The 4K video is stunning.',
        createdAt: new Date('2024-01-11')
      }
    ],
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-13')
  },
  {
    _id: '4',
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
    rating: 4.2,
    numReviews: 34,
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
    ],
    reviews: [],
    createdAt: new Date('2024-01-06'),
    updatedAt: new Date('2024-01-06')
  },
  {
    _id: '5',
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
    rating: 4.0,
    numReviews: 28,
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
    ],
    reviews: [],
    createdAt: new Date('2024-01-07'),
    updatedAt: new Date('2024-01-07')
  },
  {
    _id: '6',
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
    rating: 4.4,
    numReviews: 67,
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
    ],
    reviews: [
      {
        _id: 'r4',
        user: { name: 'Sarah Wilson' },
        rating: 4,
        title: 'Great portable speaker',
        comment: 'Love the sound quality and waterproof feature. Perfect for outdoor use.',
        createdAt: new Date('2024-01-09')
      }
    ],
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-12')
  }
];

export const mockUsers = [
  {
    _id: 'admin1',
    name: 'Admin User',
    email: 'admin@ecommerce.com',
    role: 'admin',
    phone: '+1 (555) 123-4567',
    isActive: true,
    emailVerified: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    _id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    phone: '+1 (555) 987-6543',
    isActive: true,
    emailVerified: true,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  },
  {
    _id: 'user2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user',
    phone: '+1 (555) 456-7890',
    isActive: true,
    emailVerified: true,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03')
  }
];

export const mockOrders = [
  {
    _id: 'order1',
    orderNumber: 'ORD-2024-001',
    user: 'user1',
    items: [
      {
        product: '1',
        name: 'Premium Wireless Headphones',
        slug: 'premium-wireless-headphones',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
        price: 299.99,
        quantity: 1,
        subtotal: 299.99
      }
    ],
    shippingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'United States'
    },
    billingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'United States'
    },
    paymentMethod: 'stripe',
    paymentStatus: 'paid',
    orderStatus: 'delivered',
    pricing: {
      subtotal: 299.99,
      tax: 30.00,
      shipping: 0.00,
      total: 329.99
    },
    timestamps: {
      placed: new Date('2024-01-15'),
      confirmed: new Date('2024-01-15'),
      processed: new Date('2024-01-16'),
      shipped: new Date('2024-01-17'),
      delivered: new Date('2024-01-20')
    },
    tracking: {
      trackingNumber: 'TRACK123456789',
      carrier: 'FedEx',
      estimatedDelivery: new Date('2024-01-20'),
      actualDelivery: new Date('2024-01-20')
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  }
];
