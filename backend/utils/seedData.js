export const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@ecommerce.com',
    password: 'AdminPassword123!',
    role: 'admin',
    phone: '+1 (555) 123-4567',
    isActive: true,
    emailVerified: true
  },
  {
    name: 'Demo Customer',
    email: 'demo@example.com',
    password: 'Password123!',
    role: 'user',
    phone: '+1 (555) 987-6543',
    isActive: true,
    emailVerified: true
  }
];

export const sampleProducts = [
  // --- ELECTRONICS ---
  {
    name: 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones',
    description: 'Industry-leading noise cancellation optimized with two processors and eight microphones. Exceptional sound quality with newly developed 30mm driver unit. Crystal clear hands-free calling with 4 beamforming microphones.',
    shortDescription: 'Flagship active noise canceling wireless headphones with 30-hour battery',
    sku: 'AUDIO-SONY-XM5',
    brand: 'Sony',
    category: 'electronics',
    subcategory: 'audio',
    price: 349.99,
    compareAtPrice: 399.99,
    inventory: { quantity: 45, lowStockThreshold: 8, trackQuantity: true },
    rating: 4.8,
    numReviews: 128,
    featured: true,
    status: 'active',
    tags: ['headphones', 'wireless', 'noise-canceling', 'bluetooth', 'sony'],
    specifications: [
      { key: 'Battery Life', value: 'Up to 30 Hours' },
      { key: 'Connectivity', value: 'Bluetooth 5.2 / 3.5mm Aux' },
      { key: 'Weight', value: '250g' },
      { key: 'Fast Charging', value: '3 min charge gives 3 hours playback' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
        publicId: 'sony_xm5_main',
        alt: 'Sony WH-1000XM5 Headphones',
        isMain: true
      },
      {
        url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80',
        publicId: 'sony_xm5_side',
        alt: 'Sony Headphones on Desk',
        isMain: false
      }
    ]
  },
  {
    name: 'Apple Watch Ultra 2 GPS + Cellular',
    description: 'The most rugged and capable Apple Watch. Designed for outdoor adventure, water sports, and endurance training with a lightweight 49mm titanium case, extra-long battery life, and the brightest Apple display ever.',
    shortDescription: '49mm Titanium smartwatch with precision dual-frequency GPS',
    sku: 'TECH-APPLE-WULTRA',
    brand: 'Apple',
    category: 'electronics',
    subcategory: 'wearables',
    price: 799.00,
    compareAtPrice: 849.00,
    inventory: { quantity: 30, lowStockThreshold: 5, trackQuantity: true },
    rating: 4.9,
    numReviews: 94,
    featured: true,
    status: 'active',
    tags: ['apple', 'smartwatch', 'fitness', 'gps', 'titanium'],
    specifications: [
      { key: 'Case Material', value: 'Aerospace Grade Titanium' },
      { key: 'Water Resistance', value: '100 meters' },
      { key: 'Battery Life', value: 'Up to 36 hours (72 hours in Low Power)' },
      { key: 'Display', value: 'Always-On Retina 3000 nits' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80',
        publicId: 'apple_watch_main',
        alt: 'Apple Watch Ultra',
        isMain: true
      },
      {
        url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
        publicId: 'apple_watch_lifestyle',
        alt: 'Smart Watch Profile',
        isMain: false
      }
    ]
  },
  {
    name: 'Sony Alpha 7 IV Full-Frame Mirrorless Camera',
    description: '33MP full-frame Exmor R CMOS sensor with up to 10 fps shooting and 4K 60p video recording. Real-time Eye AF for humans, animals, and birds. 5-axis in-body image stabilization.',
    shortDescription: '33MP full-frame hybrid camera for photo & 4K video creators',
    sku: 'PHOTO-SONY-A7IV',
    brand: 'Sony',
    category: 'electronics',
    subcategory: 'cameras',
    price: 2498.00,
    compareAtPrice: 2699.00,
    inventory: { quantity: 15, lowStockThreshold: 3, trackQuantity: true },
    rating: 4.9,
    numReviews: 62,
    featured: true,
    status: 'active',
    tags: ['camera', 'mirrorless', 'sony', '4k', 'photography'],
    specifications: [
      { key: 'Sensor', value: '33MP Full-Frame Exmor R' },
      { key: 'Video Resolution', value: '4K 60p 10-bit 4:2:2' },
      { key: 'Autofocus', value: '759-point Phase Detection' },
      { key: 'Stabilization', value: '5-Axis Optical SteadyShot' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
        publicId: 'camera_main',
        alt: 'Sony Alpha 7 IV Camera',
        isMain: true
      }
    ]
  },
  {
    name: 'Keychron Q1 Pro Wireless Custom Mechanical Keyboard',
    description: 'Fully customizable 75% layout mechanical keyboard with full aluminum CNC body, hot-swappable switches, double-gasket design, and wireless Bluetooth 5.1 connection.',
    shortDescription: 'Full CNC Aluminum mechanical keyboard with QMK/VIA support',
    sku: 'TECH-KEYCHRON-Q1P',
    brand: 'Keychron',
    category: 'electronics',
    subcategory: 'accessories',
    price: 199.99,
    compareAtPrice: 229.99,
    inventory: { quantity: 50, lowStockThreshold: 10, trackQuantity: true },
    rating: 4.7,
    numReviews: 76,
    featured: false,
    status: 'active',
    tags: ['keyboard', 'mechanical', 'custom', 'wireless', 'rgb'],
    specifications: [
      { key: 'Layout', value: '75% (81 keys)' },
      { key: 'Switch Type', value: 'Keychron K Pro Brown (Hot-swappable)' },
      { key: 'Body Material', value: 'Full CNC Machined Aluminum' },
      { key: 'Connectivity', value: 'Bluetooth 5.1 & Type-C Wired' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
        publicId: 'keyboard_main',
        alt: 'Keychron Mechanical Keyboard',
        isMain: true
      }
    ]
  },
  {
    name: 'Anker 737 Power Bank (PowerCore 24K 140W)',
    description: 'Ultra-powerful two-way fast charging power bank with smart digital display. Equipped with the latest Power Delivery 3.1 and bi-directional technology to quickly recharge the portable charger or get a 140W ultra-powerful charge.',
    shortDescription: '24,000mAh portable charger with 140W high-speed USB-C output',
    sku: 'TECH-ANKER-737',
    brand: 'Anker',
    category: 'electronics',
    subcategory: 'accessories',
    price: 109.99,
    compareAtPrice: 149.99,
    inventory: { quantity: 80, lowStockThreshold: 15, trackQuantity: true },
    rating: 4.8,
    numReviews: 110,
    featured: false,
    status: 'active',
    tags: ['powerbank', 'anker', 'fast-charging', 'usb-c'],
    specifications: [
      { key: 'Capacity', value: '24,000 mAh' },
      { key: 'Max Output', value: '140W Power Delivery 3.1' },
      { key: 'Display', value: 'Smart Digital Color Display' },
      { key: 'Ports', value: '2x USB-C, 1x USB-A' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80',
        publicId: 'anker_powerbank_main',
        alt: 'Anker 737 Power Bank',
        isMain: true
      }
    ]
  },
  {
    name: 'JBL Charge 5 Portable Waterproof Bluetooth Speaker',
    description: 'Take the party with you no matter what the weather. The JBL Charge 5 speaker delivers bold JBL Original Pro Sound with an optimized long excursion driver, separate tweeter, and dual pumping JBL bass radiators.',
    shortDescription: 'IP67 waterproof Bluetooth speaker with 20-hour battery & built-in powerbank',
    sku: 'AUDIO-JBL-CHARGE5',
    brand: 'JBL',
    category: 'electronics',
    subcategory: 'audio',
    price: 139.95,
    compareAtPrice: 179.95,
    inventory: { quantity: 65, lowStockThreshold: 10, trackQuantity: true },
    rating: 4.7,
    numReviews: 89,
    featured: true,
    status: 'active',
    tags: ['jbl', 'speaker', 'bluetooth', 'waterproof', 'portable'],
    specifications: [
      { key: 'Playtime', value: 'Up to 20 Hours' },
      { key: 'Waterproof Rating', value: 'IP67 Waterproof & Dustproof' },
      { key: 'Output Power', value: '30W RMS woofer, 10W RMS tweeter' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80',
        publicId: 'jbl_charge5_main',
        alt: 'JBL Bluetooth Speaker',
        isMain: true
      }
    ]
  },

  // --- FASHION & APPAREL ---
  {
    name: 'Vintage Italian Lambskin Leather Biker Jacket',
    description: 'Handcrafted from supple Italian full-grain lambskin leather. Features asymmetric zip front, polished silver-tone hardware, quilted shoulder accents, and premium silky lining.',
    shortDescription: 'Handcrafted Italian full-grain lambskin leather biker jacket',
    sku: 'FASH-JACKET-LTH01',
    brand: 'UrbanCraft',
    category: 'apparel',
    subcategory: 'outerwear',
    price: 489.00,
    compareAtPrice: 650.00,
    inventory: { quantity: 20, lowStockThreshold: 4, trackQuantity: true },
    rating: 4.9,
    numReviews: 45,
    featured: true,
    status: 'active',
    tags: ['leather', 'jacket', 'biker', 'outerwear', 'premium'],
    specifications: [
      { key: 'Material', value: '100% Full-Grain Italian Lambskin' },
      { key: 'Lining', value: '100% Breathable Viscose Silk' },
      { key: 'Hardware', value: 'Heavy Duty YKK Zippers' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80',
        publicId: 'leather_jacket_main',
        alt: 'Vintage Leather Jacket',
        isMain: true
      }
    ]
  },
  {
    name: 'Tailored Oxford Cotton Button-Down Shirt',
    description: 'A timeless staple crafted from heavyweight 100% organic combed cotton. Pre-washed for a soft broken-in feel with mother-of-pearl buttons and a sharp button-down collar.',
    shortDescription: 'Classic fit 100% organic cotton Oxford dress shirt',
    sku: 'FASH-SHIRT-OX01',
    brand: 'Heritage Co.',
    category: 'apparel',
    subcategory: 'shirts',
    price: 68.00,
    compareAtPrice: 88.00,
    inventory: { quantity: 90, lowStockThreshold: 20, trackQuantity: true },
    rating: 4.6,
    numReviews: 53,
    featured: false,
    status: 'active',
    tags: ['shirt', 'oxford', 'cotton', 'formal', 'casual'],
    specifications: [
      { key: 'Material', value: '100% Organic Combed Cotton' },
      { key: 'Fit', value: 'Tailored Modern Fit' },
      { key: 'Care', value: 'Machine Wash Cold, Hang Dry' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
        publicId: 'oxford_shirt_main',
        alt: 'Oxford Cotton Shirt',
        isMain: true
      }
    ]
  },
  {
    name: 'Pure Mongolian Cashmere Crewneck Sweater',
    description: 'Exceptionally soft and lightweight 2-ply grade-A Mongolian cashmere sweater. Designed with ribbed cuffs, hem, and collar for a relaxed yet refined everyday luxury.',
    shortDescription: 'Grade-A 100% pure Mongolian cashmere knitted sweater',
    sku: 'FASH-KNIT-CASH01',
    brand: 'LuxeStudio',
    category: 'apparel',
    subcategory: 'knitwear',
    price: 185.00,
    compareAtPrice: 250.00,
    inventory: { quantity: 35, lowStockThreshold: 7, trackQuantity: true },
    rating: 4.9,
    numReviews: 38,
    featured: true,
    status: 'active',
    tags: ['cashmere', 'sweater', 'luxury', 'knitwear'],
    specifications: [
      { key: 'Material', value: '100% Grade-A Mongolian Cashmere (2-ply)' },
      { key: 'Knit Gauge', value: '12 Gauge' },
      { key: 'Care', value: 'Dry Clean or Gentle Hand Wash' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80',
        publicId: 'cashmere_sweater_main',
        alt: 'Cashmere Knit Sweater',
        isMain: true
      }
    ]
  },
  {
    name: 'Ray-Ban Aviator Classic Polarized Sunglasses',
    description: 'Currently one of the most iconic sunglass models in the world. Ray-Ban Aviator Classic sunglasses were originally designed for U.S. aviators in 1937 with crystal polarized lenses and lightweight gold frame.',
    shortDescription: 'Iconic teardrop metal sunglasses with polarized crystal green lenses',
    sku: 'ACC-RAYBAN-AVIAT',
    brand: 'Ray-Ban',
    category: 'accessories',
    subcategory: 'eyewear',
    price: 213.00,
    compareAtPrice: 240.00,
    inventory: { quantity: 50, lowStockThreshold: 10, trackQuantity: true },
    rating: 4.8,
    numReviews: 112,
    featured: false,
    status: 'active',
    tags: ['sunglasses', 'rayban', 'polarized', 'accessories', 'eyewear'],
    specifications: [
      { key: 'Frame Material', value: 'Polished Gold Metal' },
      { key: 'Lens Technology', value: 'Polarized G-15 Green' },
      { key: 'UV Protection', value: '100% UVA/UVB Filter' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
        publicId: 'rayban_aviator_main',
        alt: 'Ray-Ban Sunglasses',
        isMain: true
      }
    ]
  },

  // --- FOOTWEAR ---
  {
    name: 'Nike Air Max 270 React Running Shoes',
    description: 'Nike\'s first lifestyle Air unit meets the softest, smoothest, and most resilient foam, Nike React. Design is inspired by the Air Max pantheon, showcasing Nike\'s greatest innovation with its large window and fresh array of colors.',
    shortDescription: 'Lightweight lifestyle running sneakers with visible Max Air cushioning',
    sku: 'SHOE-NIKE-AM270',
    brand: 'Nike',
    category: 'footwear',
    subcategory: 'sneakers',
    price: 159.99,
    compareAtPrice: 180.00,
    inventory: { quantity: 60, lowStockThreshold: 12, trackQuantity: true },
    rating: 4.7,
    numReviews: 140,
    featured: true,
    status: 'active',
    tags: ['nike', 'shoes', 'sneakers', 'running', 'airmax'],
    specifications: [
      { key: 'Upper Material', value: 'Engineered Mesh & Synthetic Overlays' },
      { key: 'Cushioning', value: '270 Max Air Unit + Nike React Foam' },
      { key: 'Outsole', value: 'Full Rubber Traction' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
        publicId: 'nike_shoes_main',
        alt: 'Nike Air Max Red Sneakers',
        isMain: true
      }
    ]
  },
  {
    name: 'Handmade Italian Leather Chelsea Boots',
    description: 'Crafted in Tuscany with rich pull-up calfskin leather and Goodyear welted construction. Features elasticized side gores, custom pull tabs, and oil-treated leather outsole with rubber grip insert.',
    shortDescription: 'Goodyear welted Tuscan calfskin leather Chelsea boots',
    sku: 'SHOE-BOOT-CHELSEA01',
    brand: 'Artisan Sole',
    category: 'footwear',
    subcategory: 'boots',
    price: 275.00,
    compareAtPrice: 340.00,
    inventory: { quantity: 25, lowStockThreshold: 5, trackQuantity: true },
    rating: 4.8,
    numReviews: 31,
    featured: false,
    status: 'active',
    tags: ['boots', 'chelsea', 'leather', 'shoes', 'handmade'],
    specifications: [
      { key: 'Construction', value: 'Goodyear Welted (Resoleable)' },
      { key: 'Upper', value: 'Full-Grain Italian Calfskin' },
      { key: 'Sole', value: 'Stacked Leather with Rubber Toplift' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=800&q=80',
        publicId: 'chelsea_boots_main',
        alt: 'Leather Chelsea Boots',
        isMain: true
      }
    ]
  },

  // --- HOME & LIVING ---
  {
    name: 'Breville Barista Touch Espresso Machine',
    description: 'Automated touchscreen coffee machine with integrated precision conical burr grinder. Delivers third-wave specialty coffee at home using the 4-key formula. Auto MilQ hands-free microfoam texturing.',
    shortDescription: 'Touchscreen espresso machine with integrated grinder & auto milk texturing',
    sku: 'HOME-BREVILLE-BES880',
    brand: 'Breville',
    category: 'home',
    subcategory: 'kitchen',
    price: 999.95,
    compareAtPrice: 1199.95,
    inventory: { quantity: 18, lowStockThreshold: 4, trackQuantity: true },
    rating: 4.9,
    numReviews: 87,
    featured: true,
    status: 'active',
    tags: ['coffee', 'espresso', 'kitchen', 'breville', 'appliances'],
    specifications: [
      { key: 'Pump Pressure', value: '15 Bar Italian Pump (9 bar extraction)' },
      { key: 'Water Tank', value: '2.0 Liters (67 fl.oz)' },
      { key: 'Heating System', value: 'ThermoJet (3 second heat up)' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80',
        publicId: 'espresso_machine_main',
        alt: 'Espresso Coffee Machine',
        isMain: true
      }
    ]
  },
  {
    name: 'Ergonomic Executive Mesh Office Chair',
    description: 'Engineered for all-day comfort with responsive 3D lumbar support, breathable Korean elastomeric mesh, 4D adjustable armrests, and dynamic synchro-tilt mechanism.',
    shortDescription: 'High-back ergonomic mesh task chair with adaptive dynamic lumbar',
    sku: 'HOME-CHAIR-ERGO01',
    brand: 'ErgoMax',
    category: 'home',
    subcategory: 'furniture',
    price: 389.00,
    compareAtPrice: 499.00,
    inventory: { quantity: 30, lowStockThreshold: 6, trackQuantity: true },
    rating: 4.7,
    numReviews: 64,
    featured: false,
    status: 'active',
    tags: ['furniture', 'chair', 'office', 'ergonomic', 'desk'],
    specifications: [
      { key: 'Weight Capacity', value: '330 lbs (150 kg)' },
      { key: 'Mechanism', value: 'Synchro-tilt with 4 recline lock positions' },
      { key: 'Warranty', value: '5-Year Manufacturer Warranty' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1580481077195-c3f2538cb81a?w=800&q=80',
        publicId: 'office_chair_main',
        alt: 'Ergonomic Mesh Chair',
        isMain: true
      }
    ]
  },
  {
    name: 'Minimalist Dimmable LED Arc Floor Lamp',
    description: 'Sculptural modern floor lamp crafted from matte black aluminum. Features seamless touch dimming, 3 color temperatures (2700K-5000K), and memory function.',
    shortDescription: 'Modern minimalist curved LED floor lamp with touch dimming',
    sku: 'HOME-LAMP-ARC01',
    brand: 'Lumina',
    category: 'home',
    subcategory: 'lighting',
    price: 149.00,
    compareAtPrice: 189.00,
    inventory: { quantity: 40, lowStockThreshold: 8, trackQuantity: true },
    rating: 4.6,
    numReviews: 42,
    featured: false,
    status: 'active',
    tags: ['lamp', 'lighting', 'decor', 'minimalist', 'home'],
    specifications: [
      { key: 'Brightness', value: '2000 Lumens (24W LED)' },
      { key: 'Color Temp', value: '2700K Warm / 4000K Neutral / 5000K Cool' },
      { key: 'Height', value: '180 cm (71 inches)' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
        publicId: 'arc_lamp_main',
        alt: 'Modern Arc Lamp',
        isMain: true
      }
    ]
  },

  // --- SPORTS & FITNESS ---
  {
    name: 'Quick-Dial Adjustable Dumbbells (Pair, 5-52.5 lbs)',
    description: 'Replaces 15 pairs of weights. Smooth dial system lets you quickly adjust weights from 5 to 52.5 lbs in 2.5 lb increments. Durable molding around metal plates creates smooth lift-off and quiet workouts.',
    shortDescription: 'Space-saving adjustable dumbbell pair from 5 to 52.5 lbs with selector dial',
    sku: 'FIT-DUMBBELL-ADJ50',
    brand: 'FlexFit',
    category: 'sports',
    subcategory: 'fitness',
    price: 349.00,
    compareAtPrice: 429.00,
    inventory: { quantity: 22, lowStockThreshold: 4, trackQuantity: true },
    rating: 4.9,
    numReviews: 95,
    featured: true,
    status: 'active',
    tags: ['fitness', 'workout', 'dumbbells', 'gym', 'weights'],
    specifications: [
      { key: 'Weight Range', value: '5 to 52.5 lbs (2.5 to 24 kg) per dumbbell' },
      { key: 'Increments', value: '2.5 lb increments for the first 25 lbs' },
      { key: 'Plates', value: 'Steel plates coated in impact-resistant thermoplastic' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80',
        publicId: 'dumbbells_main',
        alt: 'Adjustable Dumbbells',
        isMain: true
      }
    ]
  },
  {
    name: 'Eco-Friendly Non-Slip Natural Tree Rubber Yoga Mat',
    description: 'High-density natural biodegradable tree rubber base with ultra-absorbent polyurethane top layer. Alignment guide lines etched with laser for perfect posture and joint protection.',
    shortDescription: '6mm extra-thick non-slip natural rubber yoga mat with alignment guides',
    sku: 'FIT-YOGA-MAT6MM',
    brand: 'ZenForm',
    category: 'sports',
    subcategory: 'yoga',
    price: 78.00,
    compareAtPrice: 95.00,
    inventory: { quantity: 70, lowStockThreshold: 14, trackQuantity: true },
    rating: 4.8,
    numReviews: 57,
    featured: false,
    status: 'active',
    tags: ['yoga', 'fitness', 'mat', 'eco-friendly', 'sports'],
    specifications: [
      { key: 'Thickness', value: '6mm Joint-Cushioning' },
      { key: 'Material', value: '100% Natural Biodegradable Tree Rubber + PU' },
      { key: 'Dimensions', value: '72" x 26" (183cm x 66cm)' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80',
        publicId: 'yoga_mat_main',
        alt: 'Eco Rubber Yoga Mat',
        isMain: true
      }
    ]
  },
  {
    name: 'HydroFlask 32oz Wide Mouth Vacuum Insulated Bottle',
    description: 'TempShield double-wall vacuum insulation keeps beverages cold for up to 24 hours and piping hot for up to 12 hours. Made with pro-grade 18/8 stainless steel and durable powder coat.',
    shortDescription: '32oz double-wall vacuum insulated stainless steel water bottle',
    sku: 'FIT-HYDRO-32OZ',
    brand: 'HydroFlask',
    category: 'sports',
    subcategory: 'hydration',
    price: 44.95,
    compareAtPrice: 49.95,
    inventory: { quantity: 120, lowStockThreshold: 25, trackQuantity: true },
    rating: 4.9,
    numReviews: 180,
    featured: false,
    status: 'active',
    tags: ['bottle', 'hydroflask', 'hydration', 'sports', 'outdoor'],
    specifications: [
      { key: 'Capacity', value: '32 fl oz (946 ml)' },
      { key: 'Material', value: '18/8 Pro-Grade Stainless Steel (BPA-Free)' },
      { key: 'Insulation', value: 'Cold up to 24h, Hot up to 12h' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80',
        publicId: 'hydroflask_main',
        alt: 'HydroFlask Bottle',
        isMain: true
      }
    ]
  }
];
