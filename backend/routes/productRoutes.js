import express from 'express';
import multer from 'multer';
import {
  getProducts,
  getProduct,
  deleteProduct,
  createProduct,
  updateProduct,
  uploadImages,
  deleteImage,
  getCategories,
  getBrands,
  getFeaturedProducts,
  getRelatedProducts,
  addReview,
  updateReview,
  deleteReview,
  getLowStockProducts,
  updateStock
} from '../controllers/productController.js';
import {
  protect,
  restrictTo,
  optionalAuth
} from '../middleware/authMiddleware.js';
import {
  validate,
  createProductSchema,
  updateProductSchema,
  createReviewSchema,
  updateReviewSchema
} from '../utils/validators.js';

const router = express.Router();

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Max 10 files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Public routes
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/brands', getBrands);
router.get('/featured', getFeaturedProducts);
router.get('/low-stock', protect, restrictTo('admin'), getLowStockProducts);
router.get('/:id', getProduct);
router.get('/:id/related', getRelatedProducts);

// Review routes (protected)
router.post('/:id/reviews', protect, validate(createReviewSchema), addReview);
router.put(
  '/:id/reviews/:reviewId', 
  protect, 
  validate(updateReviewSchema), 
  updateReview
);
router.delete('/:id/reviews/:reviewId', protect, deleteReview);

// Admin routes
router.use(protect);
router.use(restrictTo('admin')); // All routes below this require admin role

router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.post('/upload-images', upload.array('images', 10), uploadImages);
router.post('/delete-image', deleteImage);
router.put('/:id/stock', updateStock);

export default router;
