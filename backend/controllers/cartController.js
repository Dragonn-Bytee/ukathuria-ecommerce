import cartService from '../services/cartService.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// Get user cart
export const getCart = catchAsync(async (req, res) => {
  const cart = await cartService.getCart(req.user._id);

  res.json({
    status: 'success',
    data: {
      cart
    }
  });
});

// Get guest cart
export const getGuestCart = catchAsync(async (req, res) => {
  const { sessionId } = req.query;
  
  if (!sessionId) {
    return res.json({
      status: 'success',
      data: {
        cart: { items: [], totalItems: 0, subtotal: 0 }
      }
    });
  }

  const cart = await cartService.getGuestCart(sessionId);

  res.json({
    status: 'success',
    data: {
      cart
    }
  });
});

// Add item to cart
export const addItem = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;
  
  let cart;
  if (req.user) {
    cart = await cartService.addItem(req.user._id, productId, quantity);
  } else {
    const { sessionId } = req.query;
    if (!sessionId) {
      return next(new AppError('Session ID is required for guest cart', 400));
    }
    cart = await cartService.addItemToGuestCart(sessionId, productId, quantity);
  }

  res.json({
    status: 'success',
    message: 'Item added to cart successfully',
    data: {
      cart
    }
  });
});

// Remove item from cart
export const removeItem = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  
  let cart;
  if (req.user) {
    cart = await cartService.removeItem(req.user._id, productId);
  } else {
    const { sessionId } = req.query;
    if (!sessionId) {
      return next(new AppError('Session ID is required for guest cart', 400));
    }
    cart = await cartService.removeItemFromGuestCart(sessionId, productId);
  }

  res.json({
    status: 'success',
    message: 'Item removed from cart successfully',
    data: {
      cart
    }
  });
});

// Update item quantity
export const updateItemQuantity = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  
  let cart;
  if (req.user) {
    cart = await cartService.updateItemQuantity(req.user._id, productId, quantity);
  } else {
    const { sessionId } = req.query;
    if (!sessionId) {
      return next(new AppError('Session ID is required for guest cart', 400));
    }
    cart = await cartService.updateGuestItemQuantity(sessionId, productId, quantity);
  }

  res.json({
    status: 'success',
    message: 'Cart updated successfully',
    data: {
      cart
    }
  });
});

// Clear cart
export const clearCart = catchAsync(async (req, res, next) => {
  let cart;
  if (req.user) {
    cart = await cartService.clearCart(req.user._id);
  } else {
    const { sessionId } = req.query;
    if (!sessionId) {
      return next(new AppError('Session ID is required for guest cart', 400));
    }
    cart = await cartService.clearGuestCart(sessionId);
  }

  res.json({
    status: 'success',
    message: 'Cart cleared successfully',
    data: {
      cart
    }
  });
});

// Merge guest cart with user cart
export const mergeCart = catchAsync(async (req, res, next) => {
  const { sessionId } = req.body;
  
  if (!sessionId) {
    return next(new AppError('Session ID is required', 400));
  }

  const cart = await cartService.mergeGuestCart(sessionId, req.user._id);

  res.json({
    status: 'success',
    message: 'Cart merged successfully',
    data: {
      cart
    }
  });
});

// Get cart summary
export const getCartSummary = catchAsync(async (req, res) => {
  const summary = await cartService.getCartSummary(req.user._id);

  res.json({
    status: 'success',
    data: {
      summary
    }
  });
});

// Validate cart for checkout
export const validateCart = catchAsync(async (req, res) => {
  const validation = await cartService.validateCartForCheckout(req.user._id);

  res.json({
    status: 'success',
    data: {
      validation
    }
  });
});
