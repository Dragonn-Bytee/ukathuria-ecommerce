import productService from '../services/productService.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// Get all products with filtering, sorting, and pagination
export const getProducts = catchAsync(async (req, res) => {
  const { products, pagination } = await productService.getProducts(req.query);

  res.json({
    status: 'success',
    results: products.length,
    data: {
      products,
      pagination
    }
  });
});

// Get product by ID or slug
export const getProduct = catchAsync(async (req, res) => {
  const product = await productService.getProduct(req.params.id);

  res.json({
    status: 'success',
    data: {
      product
    }
  });
});

// Create new product (Admin only)
export const createProduct = catchAsync(async (req, res) => {
  const product = await productService.createProduct(req.body, req.user._id);

  res.status(201).json({
    status: 'success',
    message: 'Product created successfully',
    data: {
      product
    }
  });
});

// Update product (Admin only)
export const updateProduct = catchAsync(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body, req.user._id);

  res.json({
    status: 'success',
    message: 'Product updated successfully',
    data: {
      product
    }
  });
});

// Delete product (Admin only)
export const deleteProduct = catchAsync(async (req, res) => {
  await productService.deleteProduct(req.params.id);

  res.json({
    status: 'success',
    message: 'Product deleted successfully'
  });
});

// Upload product images (Admin only)
export const uploadImages = catchAsync(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return next(new AppError('Please upload at least one image', 400));
  }

  const images = await productService.uploadImages(req.files);

  res.json({
    status: 'success',
    message: 'Images uploaded successfully',
    data: {
      images
    }
  });
});

// Delete product image (Admin only)
export const deleteImage = catchAsync(async (req, res) => {
  const { publicId } = req.body;
  await productService.deleteImage(publicId);

  res.json({
    status: 'success',
    message: 'Image deleted successfully'
  });
});

// Get product categories
export const getCategories = catchAsync(async (req, res) => {
  const categories = await productService.getCategories();

  res.json({
    status: 'success',
    results: categories.length,
    data: {
      categories
    }
  });
});

// Get product brands
export const getBrands = catchAsync(async (req, res) => {
  const brands = await productService.getBrands();

  res.json({
    status: 'success',
    results: brands.length,
    data: {
      brands
    }
  });
});

// Get featured products
export const getFeaturedProducts = catchAsync(async (req, res) => {
  const { limit = 8 } = req.query;
  const products = await productService.getFeaturedProducts(parseInt(limit));

  res.json({
    status: 'success',
    results: products.length,
    data: {
      products
    }
  });
});

// Get related products
export const getRelatedProducts = catchAsync(async (req, res) => {
  const { limit = 4 } = req.query;
  const products = await productService.getRelatedProducts(req.params.id, parseInt(limit));

  res.json({
    status: 'success',
    results: products.length,
    data: {
      products
    }
  });
});

// Add review to product
export const addReview = catchAsync(async (req, res) => {
  const product = await productService.addReview(req.params.id, req.user._id, req.body);

  res.json({
    status: 'success',
    message: 'Review added successfully',
    data: {
      product
    }
  });
});

// Update review
export const updateReview = catchAsync(async (req, res) => {
  const product = await productService.updateReview(
    req.params.id, 
    req.user._id, 
    req.params.reviewId, 
    req.body
  );

  res.json({
    status: 'success',
    message: 'Review updated successfully',
    data: {
      product
    }
  });
});

// Delete review
export const deleteReview = catchAsync(async (req, res) => {
  const product = await productService.deleteReview(req.params.id, req.user._id, req.params.reviewId);

  res.json({
    status: 'success',
    message: 'Review deleted successfully',
    data: {
      product
    }
  });
});

// Get products with low stock (Admin only)
export const getLowStockProducts = catchAsync(async (req, res) => {
  const products = await productService.getLowStockProducts();

  res.json({
    status: 'success',
    results: products.length,
    data: {
      products
    }
  });
});

// Update product stock (Admin only)
export const updateStock = catchAsync(async (req, res) => {
  const { quantity, operation = 'subtract' } = req.body;
  const product = await productService.updateStock(req.params.id, quantity, operation);

  res.json({
    status: 'success',
    message: 'Stock updated successfully',
    data: {
      product
    }
  });
});
