# API Documentation

## Auth Routes
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate user & get token
- `GET /api/auth/profile` - Get user profile (Protected)
- `GET /api/auth/` - Get all users (Protected, Admin)

## Product Routes
- `GET /api/products` - Fetch all products (supports pagination & search)
- `GET /api/products/:id` - Fetch single product
- `POST /api/products` - Create a product (Protected, Admin)
- `PUT /api/products/:id` - Update a product (Protected, Admin)
- `DELETE /api/products/:id` - Delete a product (Protected, Admin)

## Order Routes
- `POST /api/orders` - Create new order (Protected)
- `GET /api/orders/:id` - Get order by ID (Protected)
- `PUT /api/orders/:id/pay` - Update order to paid (Protected)
- `GET /api/orders/myorders` - Get logged in user orders (Protected)
- `GET /api/orders` - Get all orders (Protected, Admin)

## Payment Routes
- `POST /api/payments/stripe` - Create Stripe Payment Intent (Protected)
- `POST /api/payments/razorpay` - Create Razorpay Order (Protected)

## Test Credentials

### Admin Account
- **Email:** admin@example.com
- **Password:** admin123

### Standard User
- **Email:** user@example.com
- **Password:** user123
