import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import AppError from '../utils/appError.js';

class CartService {
  // Get user cart
  async getCart(userId) {
    let cart = await Cart.findOne({ user: userId })
      .populate({
        path: 'items.product',
        select: 'name slug price images inventory status'
      });

    if (!cart) {
      cart = await Cart.create({ user: userId });
    } else if (cart.isExpired()) {
      await Cart.findByIdAndDelete(cart._id);
      cart = await Cart.create({ user: userId });
    }

    // Filter out out-of-stock or inactive products
    cart.items = cart.items.filter(item => {
      return item.product && 
             item.product.status === 'active' && 
             (item.product.inventory.trackQuantity ? item.product.inventory.quantity > 0 : true);
    });

    await cart.save();

    return cart;
  }

  // Get guest cart by session ID
  async getGuestCart(sessionId) {
    let cart = await Cart.findOne({ sessionId })
      .populate({
        path: 'items.product',
        select: 'name slug price images inventory status'
      });

    if (!cart) {
      cart = await Cart.create({ sessionId });
    } else if (cart.isExpired()) {
      await Cart.findByIdAndDelete(cart._id);
      cart = await Cart.create({ sessionId });
    }

    // Filter out out-of-stock or inactive products
    cart.items = cart.items.filter(item => {
      return item.product && 
             item.product.status === 'active' && 
             (item.product.inventory.trackQuantity ? item.product.inventory.quantity > 0 : true);
    });

    await cart.save();

    return cart;
  }

  // Add item to cart
  async addItem(userId, productId, quantity) {
    // Validate product
    const product = await Product.findById(productId);
    
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (product.status !== 'active') {
      throw new AppError('Product is not available', 400);
    }

    // Check stock
    if (product.inventory.trackQuantity && product.inventory.quantity < quantity) {
      throw new AppError('Insufficient stock', 400);
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      cart = await Cart.create({ user: userId });
    }

    // Add item to cart
    await cart.addItem(productId, quantity, product.price);

    // Return populated cart
    return await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name slug price images inventory status'
      });
  }

  // Add item to guest cart
  async addItemToGuestCart(sessionId, productId, quantity) {
    // Validate product
    const product = await Product.findById(productId);
    
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (product.status !== 'active') {
      throw new AppError('Product is not available', 400);
    }

    // Check stock
    if (product.inventory.trackQuantity && product.inventory.quantity < quantity) {
      throw new AppError('Insufficient stock', 400);
    }

    // Get or create cart
    let cart = await Cart.findOne({ sessionId });
    
    if (!cart) {
      cart = await Cart.create({ sessionId });
    }

    // Add item to cart
    await cart.addItem(productId, quantity, product.price);

    // Return populated cart
    return await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name slug price images inventory status'
      });
  }

  // Remove item from cart
  async removeItem(userId, productId) {
    const cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    await cart.removeItem(productId);

    return await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name slug price images inventory status'
      });
  }

  // Remove item from guest cart
  async removeItemFromGuestCart(sessionId, productId) {
    const cart = await Cart.findOne({ sessionId });
    
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    await cart.removeItem(productId);

    return await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name slug price images inventory status'
      });
  }

  // Update item quantity
  async updateItemQuantity(userId, productId, quantity) {
    const cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    // Validate product and stock
    const product = await Product.findById(productId);
    
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (product.inventory.trackQuantity && product.inventory.quantity < quantity) {
      throw new AppError('Insufficient stock', 400);
    }

    await cart.updateItemQuantity(productId, quantity);

    return await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name slug price images inventory status'
      });
  }

  // Update item quantity in guest cart
  async updateGuestItemQuantity(sessionId, productId, quantity) {
    const cart = await Cart.findOne({ sessionId });
    
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    // Validate product and stock
    const product = await Product.findById(productId);
    
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (product.inventory.trackQuantity && product.inventory.quantity < quantity) {
      throw new AppError('Insufficient stock', 400);
    }

    await cart.updateItemQuantity(productId, quantity);

    return await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name slug price images inventory status'
      });
  }

  // Clear cart
  async clearCart(userId) {
    const cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    await cart.clearCart();

    return cart;
  }

  // Clear guest cart
  async clearGuestCart(sessionId) {
    const cart = await Cart.findOne({ sessionId });
    
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    await cart.clearCart();

    return cart;
  }

  // Merge guest cart with user cart
  async mergeGuestCart(sessionId, userId) {
    const guestCart = await Cart.findOne({ sessionId });
    
    if (!guestCart) {
      return await this.getCart(userId);
    }

    const userCart = await Cart.findOne({ user: userId });

    if (!userCart) {
      // Transfer guest cart to user
      guestCart.user = userId;
      guestCart.sessionId = undefined;
      await guestCart.save();
      
      return await Cart.findById(guestCart._id)
        .populate({
          path: 'items.product',
          select: 'name slug price images inventory status'
        });
    }

    // Merge items
    for (const guestItem of guestCart.items) {
      const existingItem = userCart.items.find(
        item => item.product.toString() === guestItem.product.toString()
      );

      if (existingItem) {
        existingItem.quantity += guestItem.quantity;
      } else {
        userCart.items.push(guestItem);
      }
    }

    await userCart.save();
    
    // Delete guest cart
    await Cart.findByIdAndDelete(guestCart._id);

    return await Cart.findById(userCart._id)
      .populate({
        path: 'items.product',
        select: 'name slug price images inventory status'
      });
  }

  // Get cart summary
  async getCartSummary(userId) {
    const cart = await this.getCart(userId);
    
    const summary = {
      totalItems: cart.totalItems,
      subtotal: cart.subtotal,
      items: cart.items.map(item => ({
        productId: item.product._id,
        name: item.product.name,
        slug: item.product.slug,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
        image: item.product.images[0]?.url || null,
        inStock: item.product.inventory.trackQuantity ? 
          item.product.inventory.quantity > 0 : true
      }))
    };

    return summary;
  }

  // Validate cart items for checkout
  async validateCartForCheckout(userId) {
    const cart = await this.getCart(userId);
    
    if (!cart || cart.items.length === 0) {
      throw new AppError('Cart is empty', 400);
    }

    const validationResults = [];
    let isValid = true;

    for (const item of cart.items) {
      const product = item.product;
      
      if (!product) {
        validationResults.push({
          productId: item.product,
          error: 'Product not found'
        });
        isValid = false;
        continue;
      }

      if (product.status !== 'active') {
        validationResults.push({
          productId: product._id,
          name: product.name,
          error: 'Product is no longer available'
        });
        isValid = false;
        continue;
      }

      if (product.inventory.trackQuantity && product.inventory.quantity < item.quantity) {
        validationResults.push({
          productId: product._id,
          name: product.name,
          error: `Only ${product.inventory.quantity} items available in stock`,
          availableStock: product.inventory.quantity
        });
        isValid = false;
      }
    }

    return {
      isValid,
      validationResults,
      cart
    };
  }
}

export default new CartService();
