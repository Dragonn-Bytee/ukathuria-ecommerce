# Deployment Guide

## 1. Backend Deployment (Render)

1. Push your code to a GitHub repository.
2. Go to [Render.com](https://render.com) and create a new **Web Service**.
3. Connect your GitHub repository.
4. Either set **Root Directory** to `backend`, **or** leave root empty and use the root `package.json` (included in this repo):
   - **Build Command**: `npm run build` (or `npm install --prefix backend`)
   - **Start Command**: `npm start` (or `node backend/server.js`)
5. If using the `backend` folder as root directory:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
7. Set **Health Check Path**: `/health`
8. In the environment variables section, add the keys from `backend/.env.example`:
   - `MONGO_URI` — your MongoDB Atlas connection string
   - `JWT_SECRET` — a long random secret (32+ characters)
   - `JWT_REFRESH_SECRET` — another long random secret
   - `NODE_ENV=production`
   - `ALLOWED_ORIGINS=https://ukathuria-ecommerce.vercel.app`
9. Deploy the service. Once deployed, copy your **exact** Render URL from the dashboard (e.g. `https://ukathuria-ecommerce-5bte.onrender.com`).

### Verify the backend is running

```bash
curl https://ukathuria-ecommerce-5bte.onrender.com/health
```

You should get a JSON response like `{"status":"success","message":"Server is healthy",...}`.

If you get `Not Found` with header `x-render-routing: no-server`, the Render service is down, deleted, or failed to deploy.

## 2. Frontend Deployment (Vercel)

1. Push changes to GitHub.
2. Go to [Vercel.com](https://vercel.com) and create a new Project.
3. Import your GitHub repository.
4. Set the **Root Directory** to `frontend`.
5. Framework Preset: **Vite**.
6. Build Command: `npm run build`
7. Output Directory: `dist`
8. Add this environment variable:
   - `VITE_API_URL` = `https://ukathuria-ecommerce-5bte.onrender.com/api` (your exact Render URL + `/api`)
9. Click **Deploy**, then **Redeploy** after any env var change so the build picks it up.

Your full-stack application is now live.

## Troubleshooting "Network Error" / CORS errors

The browser often shows a **CORS error** when the real problem is that the **backend is not responding**.

| Symptom | Likely cause | Fix |
|--------|--------------|-----|
| `x-render-routing: no-server` in response headers | Render service missing or suspended | Recreate or resume the Render web service |
| CORS blocked, no `Access-Control-Allow-Origin` | Backend down or crashed on startup | Check Render logs; fix `MONGO_URI` / env vars |
| 502 / timeout on first request | Render free tier cold start (~30–60s) | Wait and retry, or upgrade plan |
| Frontend still hits `localhost` | `VITE_API_URL` not set on Vercel | Add env var and redeploy frontend |

### Common Render startup failures

- **Missing `MONGO_URI`** — server exits immediately in production.
- **Invalid MongoDB Atlas URI** — check IP allowlist (`0.0.0.0/0` for Render) and credentials.
- **Missing `JWT_SECRET`** — auth routes may fail at runtime.

Check **Render → your service → Logs** for errors like `Error: ...` or `UNHANDLED REJECTION`.
