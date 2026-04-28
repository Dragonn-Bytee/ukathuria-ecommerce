import Product from '../models/Product.js';
import AppError from '../utils/appError.js';
import cloudinary from 'cloudinary';

class ProductService {
  // Get all products with filtering, sorting, and pagination
  async getProducts(query) {
    const {
      page = 1,
      limit = 12,
      sort = '-createdAt',
      fields,
      status,
      category,
      subcategory,
      brand,
      minPrice,
      maxPrice,
      rating,
      featured,
      search,
      inStock
    } = query;

    // Build query
    const queryObj = status === 'all' ? {} : { status: status || 'active' };

    // Category filtering
    if (category) {
      queryObj.category = category.toLowerCase();
    }

    if (subcategory) {
      queryObj.subcategory = subcategory.toLowerCase();
    }

    if (brand) {
      queryObj.brand = new RegExp(brand, 'i');
    }

    // Price filtering
    if (minPrice || maxPrice) {
      queryObj.price = {};
      if (minPrice) queryObj.price.$gte = parseFloat(minPrice);
      if (maxPrice) queryObj.price.$lte = parseFloat(maxPrice);
    }

    // Rating filtering
    if (rating) {
      queryObj.rating = { $gte: parseFloat(rating) };
    }

    // Featured filtering
    if (featured === 'true') {
      queryObj.featured = true;
    }

    // Stock filtering
    if (inStock === 'true') {
      queryObj['inventory.quantity'] = { $gt: 0 };
    }

    // Search functionality
    if (search) {
      queryObj.$text = { $search: search };
    }

    // Field selection
    let selectFields = '';
    if (fields) {
      selectFields = fields.split(',').join(' ');
    }

    // Execute query with pagination
    const products = await Product.find(queryObj)
      .select(selectFields)
      .populate('createdBy', 'name')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total count for pagination
    const total = await Product.countDocuments(queryObj);

    return {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get product by ID or slug
  async getProduct(idOrSlug) {
    let product;
    
    // Try to find by ID first
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(idOrSlug)
        .populate('createdBy', 'name')
        .populate('reviews.user', 'name');
    }
    
    // If not found by ID, try by slug
    if (!product) {
      product = await Product.findOne({ slug: idOrSlug })
        .populate('createdBy', 'name')
        .populate('reviews.user', 'name');
    }

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return product;
  }

  // Create new product (Admin only)
  async createProduct(productData, userId) {
    // Generate SKU if not provided
    if (!productData.sku) {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      productData.sku = `SKU-${timestamp}-${random}`;
    }

    // Set created by and default to active so it shows immediately
    productData.createdBy = userId;
    if (!productData.status) {
      productData.status = 'active';
    }

    const product = await Product.create(productData);
    
    // Populate creator info
    await product.populate('createdBy', 'name');

    return product;
  }

  // Update product (Admin only)
  async updateProduct(id, updateData, userId) {
    const product = await Product.findById(id);
    
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Update last modified by
    updateData.updatedBy = userId;

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name');

    return updatedProduct;
  }

  // Delete product (Admin only)
  async deleteProduct(id) {
    const product = await Product.findById(id);
    
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        if (image.publicId) {
          await cloudinary.uploader.destroy(image.publicId);
        }
      }
    }

    await Product.findByIdAndDelete(id);
  }

  // Upload product images
  async uploadImages(files) {
    const uploadPromises = files.map(async (file) => {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'ecommerce/products',
          crop: 'scale',
          quality: 'auto:good'
        });

        return {
          url: result.secure_url,
          publicId: result.public_id,
          alt: file.originalname || 'Product image'
        };
      } catch (error) {
        console.error('Error uploading image:', error);
        throw new AppError('Failed to upload image', 500);
      }
    });

    return Promise.all(uploadPromises);
  }

  // Delete product image
  async deleteImage(publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw new AppError('Failed to delete image', 500);
    }
  }

  // Get product categories
  async getCategories() {
    const categories = await Product.distinct('category', { status: 'active' });
    return categories.sort();
  }

  // Get product brands
  async getBrands() {
    const brands = await Product.distinct('brand', { status: 'active' });
    return brands.sort();
  }

  // Get featured products
  async getFeaturedProducts(limit = 8) {
    const products = await Product.find({ 
      featured: true, 
      status: 'active' 
    })
      .populate('createdBy', 'name')
      .sort({ rating: -1, createdAt: -1 })
      .limit(limit);

    return products;
  }

  // Get related products
  async getRelatedProducts(productId, limit = 4) {
    const product = await Product.findById(productId);
    
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const relatedProducts = await Product.find({
      _id: { $ne: productId },
      $or: [
        { category: product.category },
        { brand: product.brand }
      ],
      status: 'active'
    })
      .populate('createdBy', 'name')
      .sort({ rating: -1, createdAt: -1 })
      .limit(limit);

    return relatedProducts;
  }

  // Add review to product
  async addReview(productId, userId, reviewData) {
    const product = await Product.findById(productId);
    
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Check if user has already reviewed
    const existingReview = product.reviews.find(
      review => review.user.toString() === userId.toString()
    );

    if (existingReview) {
      throw new AppError('You have already reviewed this product', 400);
    }

    // Add review
    product.reviews.push({
      user: userId,
      ...reviewData
    });

    // Recalculate rating
    product.calculateRating();

    await product.save();

    // Populate user info for the new review
    await product.populate('reviews.user', 'name');

    return product;
  }

  // Update review
  async updateReview(productId, userId, reviewId, updateData) {
    const product = await Product.findById(productId);
    
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const review = product.reviews.id(reviewId);
    
    if (!review) {
      throw new AppError('Review not found', 404);
    }

    // Check if review belongs to user or user is admin
    if (review.user.toString() !== userId.toString()) {
      throw new AppError('You can only update your own reviews', 403);
    }

    // Update review
    Object.assign(review, updateData);
    
    // Recalculate rating
    product.calculateRating();

    await product.save();

    return product;
  }

  // Delete review
  async deleteReview(productId, userId, reviewId) {
    const product = await Product.findById(productId);
    
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const review = product.reviews.id(reviewId);
    
    if (!review) {
      throw new AppError('Review not found', 404);
    }

    // Check if review belongs to user or user is admin
    if (review.user.toString() !== userId.toString()) {
      throw new AppError('You can only delete your own reviews', 403);
    }

    // Remove review
    product.reviews.pull(reviewId);
    
    // Recalculate rating
    product.calculateRating();

    await product.save();

    return product;
  }

  // Get products with low stock
  async getLowStockProducts() {
    const products = await Product.find({
      'inventory.quantity': { $lte: '$inventory.lowStockThreshold' },
      status: 'active'
    })
      .populate('createdBy', 'name')
      .sort({ 'inventory.quantity': 1 });

    return products;
  }

  // Update stock
  async updateStock(productId, quantity, operation = 'subtract') {
    const product = await Product.findById(productId);
    
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (operation === 'subtract') {
      if (product.inventory.trackQuantity && product.inventory.quantity < quantity) {
        throw new AppError('Insufficient stock', 400);
      }
      product.inventory.quantity -= quantity;
    } else if (operation === 'add') {
      product.inventory.quantity += quantity;
    }

    await product.save();
    return product;
  }
}

export default new ProductService();
