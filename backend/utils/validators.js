import Joi from 'joi';

// Common validation patterns
const patterns = {
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required'
  }),
  name: Joi.string().trim().min(2).max(50).required().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 50 characters',
    'any.required': 'Name is required'
  }),
  phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).messages({
    'string.pattern.base': 'Please provide a valid phone number'
  })
};

// User validation schemas
export const registerSchema = Joi.object({
  name: patterns.name,
  email: patterns.email,
  password: patterns.password,
  phone: patterns.phone.optional()
});

export const loginSchema = Joi.object({
  email: patterns.email,
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required'
  }),
  newPassword: patterns.password
});

export const updateProfileSchema = Joi.object({
  name: patterns.name.optional(),
  phone: patterns.phone.optional(),
  addresses: Joi.array().items(
    Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      postalCode: Joi.string().required(),
      country: Joi.string().required(),
      isDefault: Joi.boolean().default(false)
    })
  ).optional()
});

// Product validation schemas
export const createProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'any.required': 'Product name is required',
    'string.min': 'Product name must be at least 2 characters',
    'string.max': 'Product name cannot exceed 100 characters'
  }),
  description: Joi.string().min(2).max(2000).required().messages({
    'any.required': 'Description is required',
    'string.min': 'Description must be at least 2 characters',
    'string.max': 'Description cannot exceed 2000 characters'
  }),
  shortDescription: Joi.string().max(500).optional(),
  sku: Joi.string().pattern(/^[A-Z0-9-_]+$/).optional().messages({
    'string.pattern.base': 'SKU must contain only uppercase letters, numbers, hyphens, and underscores'
  }),
  price: Joi.number().positive().required().messages({
    'any.required': 'Price is required',
    'number.positive': 'Price must be a positive number'
  }),
  compareAtPrice: Joi.number().positive().optional(),
  cost: Joi.number().positive().optional(),
  brand: Joi.string().trim().required().messages({
    'any.required': 'Brand is required'
  }),
  category: Joi.string().trim().required().messages({
    'any.required': 'Category is required'
  }),
  subcategory: Joi.string().trim().optional(),
  weight: Joi.object({
    value: Joi.number().positive().required(),
    unit: Joi.string().valid('g', 'kg', 'oz', 'lb').required()
  }).optional(),
  dimensions: Joi.object({
    length: Joi.number().positive().required(),
    width: Joi.number().positive().required(),
    height: Joi.number().positive().required(),
    unit: Joi.string().valid('cm', 'in').required()
  }).optional(),
  inventory: Joi.object({
    quantity: Joi.number().integer().min(0).default(0),
    lowStockThreshold: Joi.number().integer().min(0).default(5),
    trackQuantity: Joi.boolean().default(true),
    allowBackorder: Joi.boolean().default(false)
  }).optional(),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  specifications: Joi.array().items(
    Joi.object({
      key: Joi.string().required(),
      value: Joi.string().required()
    })
  ).optional(),
  seo: Joi.object({
    title: Joi.string().max(60).optional(),
    description: Joi.string().max(160).optional(),
    keywords: Joi.array().items(Joi.string().trim()).optional()
  }).optional()
});

export const updateProductSchema = createProductSchema.fork(
  ['name', 'description', 'sku', 'price', 'brand', 'category'],
  (schema) => schema.optional()
);

// Cart validation schemas
export const addToCartSchema = Joi.object({
  productId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
    'any.required': 'Product ID is required',
    'string.pattern.base': 'Invalid product ID format'
  }),
  quantity: Joi.number().integer().min(1).max(10).required().messages({
    'any.required': 'Quantity is required',
    'number.min': 'Quantity must be at least 1',
    'number.max': 'Quantity cannot exceed 10'
  })
});

export const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).max(10).required().messages({
    'any.required': 'Quantity is required',
    'number.min': 'Quantity must be at least 1',
    'number.max': 'Quantity cannot exceed 10'
  })
});

// Order validation schemas
export const createOrderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
      quantity: Joi.number().integer().min(1).required(),
      price: Joi.number().positive().required()
    })
  ).min(1).required().messages({
    'array.min': 'Order must contain at least one item'
  }),
  shippingAddress: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    postalCode: Joi.string().required(),
    country: Joi.string().required()
  }).required(),
  billingAddress: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    postalCode: Joi.string().required(),
    country: Joi.string().required()
  }).optional(),
  paymentMethod: Joi.string().valid('stripe', 'razorpay', 'paypal', 'cod').required(),
  notes: Joi.object({
    customer: Joi.string().max(500).optional()
  }).optional()
});

// Payment validation schemas
export const createPaymentSchema = Joi.object({
  orderId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  method: Joi.string().valid('stripe', 'razorpay', 'paypal', 'cod').required(),
  amount: Joi.number().positive().required()
});

// Review validation schemas
export const createReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required().messages({
    'any.required': 'Rating is required',
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating cannot exceed 5'
  }),
  title: Joi.string().trim().min(2).max(100).required().messages({
    'any.required': 'Review title is required',
    'string.min': 'Review title must be at least 2 characters',
    'string.max': 'Review title cannot exceed 100 characters'
  }),
  comment: Joi.string().trim().min(10).max(1000).required().messages({
    'any.required': 'Review comment is required',
    'string.min': 'Review comment must be at least 10 characters',
    'string.max': 'Review comment cannot exceed 1000 characters'
  })
});

export const updateReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).optional().messages({
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating cannot exceed 5'
  }),
  title: Joi.string().trim().min(2).max(100).optional().messages({
    'string.min': 'Review title must be at least 2 characters',
    'string.max': 'Review title cannot exceed 100 characters'
  }),
  comment: Joi.string().trim().min(10).max(1000).optional().messages({
    'string.min': 'Review comment must be at least 10 characters',
    'string.max': 'Review comment cannot exceed 1000 characters'
  })
});

// Admin validation schemas
export const updateUserStatusSchema = Joi.object({
  isActive: Joi.boolean().required(),
  role: Joi.string().valid('user', 'admin').optional()
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned').required(),
  reason: Joi.string().when('status', {
    is: Joi.string().valid('cancelled', 'returned'),
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  tracking: Joi.object({
    trackingNumber: Joi.string().optional(),
    carrier: Joi.string().optional(),
    estimatedDelivery: Joi.date().optional()
  }).optional()
});

// Validation middleware factory
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');
      
      return res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    req[property] = value;
    next();
  };
};
