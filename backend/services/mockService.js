import { mockProducts, mockUsers, mockOrders } from '../utils/mockData.js';

class MockService {
  constructor() {
    this.products = [...mockProducts];
    this.users = [...mockUsers];
    this.orders = [...mockOrders];
    this.carts = new Map(); // userId -> cart
    this.sessions = new Map(); // sessionId -> cart
  }

  // Product methods
  async getProducts(filters = {}) {
    let products = [...this.products];
    
    // Apply filters
    if (filters.search) {
      const search = filters.search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(search) || 
        p.description.toLowerCase().includes(search)
      );
    }
    
    if (filters.category) {
      products = products.filter(p => p.category === filters.category);
    }
    
    if (filters.brand) {
      products = products.filter(p => p.brand === filters.brand);
    }
    
    if (filters.minPrice) {
      products = products.filter(p => p.price >= parseFloat(filters.minPrice));
    }
    
    if (filters.maxPrice) {
      products = products.filter(p => p.price <= parseFloat(filters.maxPrice));
    }
    
    if (filters.featured) {
      products = products.filter(p => p.featured);
    }
    
    // Apply sorting
    if (filters.sort) {
      switch (filters.sort) {
        case '-createdAt':
          products.sort((a, b) => b.createdAt - a.createdAt);
          break;
        case 'price':
          products.sort((a, b) => a.price - b.price);
          break;
        case '-price':
          products.sort((a, b) => b.price - a.price);
          break;
        case '-rating':
          products.sort((a, b) => b.rating - a.rating);
          break;
        case 'name':
          products.sort((a, b) => a.name.localeCompare(b.name));
          break;
      }
    }
    
    // Apply pagination
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
      products: products.slice(startIndex, endIndex),
      pagination: {
        page,
        limit,
        total: products.length,
        pages: Math.ceil(products.length / limit)
      }
    };
  }

  async getProduct(id) {
    const product = this.products.find(p => p._id === id);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  async getFeaturedProducts(limit = 8) {
    return this.products.filter(p => p.featured).slice(0, limit);
  }

  async getCategories() {
    const categories = [...new Set(this.products.map(p => p.category))];
    return categories;
  }

  async getBrands() {
    const brands = [...new Set(this.products.map(p => p.brand))];
    return brands;
  }

  async createProductReview(productId, reviewData) {
    const product = this.products.find(p => p._id === productId);
    if (!product) {
      throw new Error('Product not found');
    }
    
    const newReview = {
      _id: `r${Date.now()}`,
      user: { name: 'Current User' },
      rating: reviewData.rating,
      title: reviewData.title,
      comment: reviewData.comment,
      createdAt: new Date()
    };
    
    product.reviews.push(newReview);
    
    // Recalculate rating
    const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.rating = Math.round((totalRating / product.reviews.length) * 10) / 10;
    product.numReviews = product.reviews.length;
    
    return newReview;
  }

  // User methods
  async findUserByEmail(email) {
    return this.users.find(u => u.email === email);
  }

  async createUser(userData) {
    const newUser = {
      _id: `user${Date.now()}`,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }

  async getUserById(id) {
    return this.users.find(u => u._id === id);
  }

  // Cart methods
  async getCart(userId, sessionId = null) {
    let cart;
    
    if (userId) {
      cart = this.carts.get(userId);
    } else if (sessionId) {
      cart = this.sessions.get(sessionId);
    }
    
    if (!cart) {
      cart = {
        items: [],
        totalItems: 0,
        subtotal: 0,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };
      
      if (userId) {
        this.carts.set(userId, cart);
      } else if (sessionId) {
        this.sessions.set(sessionId, cart);
      }
    }
    
    return cart;
  }

  async addToCart(userId, productId, quantity, sessionId = null) {
    const cart = await this.getCart(userId, sessionId);
    const product = await this.getProduct(productId);
    
    const existingItem = cart.items.find(item => item.product._id === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product,
        quantity,
        price: product.price,
        addedAt: new Date()
      });
    }
    
    // Recalculate totals
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return cart;
  }

  async updateCartItem(userId, productId, quantity, sessionId = null) {
    const cart = await this.getCart(userId, sessionId);
    const itemIndex = cart.items.findIndex(item => item.product._id === productId);
    
    if (itemIndex === -1) {
      throw new Error('Item not found in cart');
    }
    
    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }
    
    // Recalculate totals
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return cart;
  }

  async removeFromCart(userId, productId, sessionId = null) {
    return this.updateCartItem(userId, productId, 0, sessionId);
  }

  async clearCart(userId, sessionId = null) {
    if (userId) {
      this.carts.delete(userId);
    } else if (sessionId) {
      this.sessions.delete(sessionId);
    }
    
    return {
      items: [],
      totalItems: 0,
      subtotal: 0
    };
  }

  // Order methods
  async createOrder(orderData) {
    const newOrder = {
      _id: `order${Date.now()}`,
      orderNumber: `ORD-${Date.now()}`,
      ...orderData,
      timestamps: {
        placed: new Date(),
        confirmed: new Date()
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.orders.push(newOrder);
    return newOrder;
  }

  async getOrders(userId) {
    return this.orders.filter(o => o.user === userId);
  }

  async getOrderById(id) {
    const order = this.orders.find(o => o._id === id);
    if (!order) {
      throw new Error('Order not found');
    }
    return order;
  }

  async getAllOrders() {
    return this.orders;
  }

  async updateOrderStatus(orderId, status) {
    const order = this.orders.find(o => o._id === orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    
    order.orderStatus = status;
    order.timestamps[status] = new Date();
    order.updatedAt = new Date();
    
    return order;
  }

  // Authentication methods (mock)
  async authenticateUser(email, password) {
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // In a real app, you'd hash and compare passwords
    // For mock, we'll accept any password for demo users
    if (email === 'admin@ecommerce.com' && password === 'admin123') {
      return user;
    } else if (email === 'john@example.com' && password === 'password123') {
      return user;
    } else if (email === 'jane@example.com' && password === 'password123') {
      return user;
    }
    
    throw new Error('Invalid credentials');
  }

  async registerUser(userData) {
    const existingUser = await this.findUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    const newUser = await this.createUser({
      ...userData,
      role: 'user',
      isActive: true,
      emailVerified: false
    });
    
    return newUser;
  }
}

export default new MockService();
