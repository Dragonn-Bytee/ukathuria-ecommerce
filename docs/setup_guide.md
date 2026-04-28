# MERN E-Commerce Platform Setup Guide

## Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account (or local MongoDB)
- Stripe Account
- Razorpay Account
- Cloudinary Account

## Step-by-Step Installation

### 1. Clone & Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Environment Variables Setup

Create a `.env` file in the `backend` folder with the following keys:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 3. Run the Application

**Start Backend (runs on port 5000):**
```bash
cd backend
npm run dev
```

**Start Frontend (runs on port 5173):**
```bash
cd frontend
npm run dev
```

The app will be accessible at `http://localhost:5173`.
