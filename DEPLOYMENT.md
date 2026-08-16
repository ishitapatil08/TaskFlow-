# 🌐 Production Deployment Guide — TaskFlow

This document covers how to deploy **TaskFlow** (Express API + BullMQ Email Worker + PostgreSQL + Redis) to production cloud platforms.

---

## 🏗️ Cloud Infrastructure Requirements

TaskFlow requires 4 services running together:
1. **Express REST API Server** (Port 3000)
2. **BullMQ Background Email Worker** (Node.js background process)
3. **PostgreSQL Database** (v16 with `pg_crypto` & `uuid-ossp`)
4. **Redis Cache & Queue Store** (v7)

---

## 🚀 Option 1: 1-Click Deployment on Render.com (Recommended Free/Low-Cost)

[Render](https://render.com) supports multi-container web services and background workers out of the box.

### Step-by-Step Instructions:

1. **Sign Up / Log In to Render**: Go to [dashboard.render.com](https://dashboard.render.com).
2. **Create Managed PostgreSQL Database**:
   - Click **New** → **PostgreSQL**.
   - Set Name: `taskflow-postgres`, Database Name: `taskflow_db`.
   - Copy the **Internal Database URL** provided.

3. **Create Managed Redis Cache**:
   - Click **New** → **Redis**.
   - Set Name: `taskflow-redis`.
   - Copy the **Internal Redis Hostname** & **Port**.

4. **Deploy Express Web API**:
   - Click **New** → **Web Service**.
   - Connect your GitHub Repository: `ishitapatil08/TaskFlow-`.
   - Environment: `Node`.
   - Build Command: `npm install && npx prisma generate && npm run build && npx prisma migrate deploy`
   - Start Command: `npm start`
   - Add Environment Variables:
     - `DATABASE_URL`: *(Your Render PostgreSQL Internal URL)*
     - `REDIS_HOST`: *(Your Render Redis Hostname)*
     - `REDIS_PORT`: `6379`
     - `JWT_ACCESS_SECRET`: `super_secret_access_key_taskflow_123!`
     - `JWT_REFRESH_SECRET`: `super_secret_refresh_key_taskflow_456!`
     - `NODE_ENV`: `production`

5. **Deploy Background Email Worker**:
   - Click **New** → **Background Worker**.
   - Connect the same repository: `ishitapatil08/TaskFlow-`.
   - Start Command: `npm run start:worker`
   - Reuse the same Environment Variables (`DATABASE_URL`, `REDIS_HOST`, etc.).

---

## ⚡ Option 2: Full Docker Deployment on Railway.app

[Railway](https://railway.app) natively deploys `docker-compose.yml` directly from GitHub.

1. Go to [railway.app](https://railway.app) and create a **New Project**.
2. Select **Deploy from GitHub repo** → select `ishitapatil08/TaskFlow-`.
3. Provision **Postgres** & **Redis** plugins in 1 click inside the project canvas.
4. Set environment variables and click **Deploy**.

---

## 🔒 Security Best Practices for Production

- **JWT Secrets**: Change `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` to cryptographically strong random strings (e.g. `openssl rand -hex 32`).
- **Database Connection**: Always set `sslmode=require` in production `DATABASE_URL` connections.
- **CORS Configuration**: Restrict allowed origins in `src/app.ts` to your production frontend domain.
