# Deployment Guide

## 1. Backend Deployment (Render / Heroku)

1. Push your code to a GitHub repository.
2. Go to Render.com and create a new **Web Service**.
3. Connect your GitHub repository.
4. Set the Root Directory to `backend`.
5. Set Build Command: `npm install`
6. Set Start Command: `node server.js`
7. In the environment variables section, add all the keys from your `.env` file.
8. Deploy the service. Once deployed, note down the deployed API URL (e.g., `https://my-ecommerce-api.onrender.com`).

## 2. Frontend Deployment (Vercel / Netlify)

1. In your `frontend/src/store/slices/authSlice.js` (and other slices/api files), change the `API_URL` from `http://localhost:5000` to your deployed backend URL.
2. Push changes to GitHub.
3. Go to Vercel.com and create a new Project.
4. Import your GitHub repository.
5. Set the Root Directory to `frontend`.
6. Framework Preset: `Vite`.
7. Build Command: `npm run build`
8. Output Directory: `dist`
9. Click Deploy.

Your Full-Stack Application is now live!
