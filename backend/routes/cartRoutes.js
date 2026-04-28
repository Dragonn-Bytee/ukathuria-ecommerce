import express from 'express';
import {
  getCart,
  getGuestCart,
  addItem,
  removeItem,
  updateItemQuantity,
  clearCart,
  mergeCart,
  getCartSummary,
  validateCart
} from '../controllers/cartController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import {
  validate,
  addToCartSchema,
  updateCartItemSchema
} from '../utils/validators.js';

const router = express.Router();

// Public routes (for guest carts)
router.get('/guest', getGuestCart);
router.post('/guest/add', validate(addToCartSchema), addItem);
router.delete('/guest/:productId', removeItem);
router.put('/guest/:productId', validate(updateCartItemSchema), updateItemQuantity);
router.delete('/guest', clearCart);

// Protected routes (for authenticated users)
router.use(protect); // All routes below this require authentication

router.get('/', getCart);
router.post('/add', validate(addToCartSchema), addItem);
router.delete('/:productId', removeItem);
router.put('/:productId', validate(updateCartItemSchema), updateItemQuantity);
router.delete('/', clearCart);
router.post('/merge', mergeCart);
router.get('/summary', getCartSummary);
router.get('/validate', validateCart);

export default router;
