# TaskFlow — Multi-Tenant Backend System

![TaskFlow API](https://img.shields.io/badge/Node.js-v20-green)
![TypeScript](https://img.shields.io/badge/TypeScript-v5.3-blue)
![Express](https://img.shields.io/badge/Express-v4.18-black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v16-blue)
![Prisma](https://img.shields.io/badge/Prisma-v5.10-teal)
![BullMQ](https://img.shields.io/badge/BullMQ-v5.4-red)
![Docker](https://img.shields.io/badge/Docker-Compose-blue)

TaskFlow is a production-grade, lightweight multi-tenant project management backend system where users belong to organizations, create projects, manage tasks, assign work, and receive asynchronous background notifications.

---

## 🌟 Highlights & Task Compliance

| Module | Features Implemented | Bonus Implemented |
| :--- | :--- | :--- |
| **Task 01: Data Modeling** | 8 PostgreSQL tables, FK `CASCADE`/`RESTRICT` rules, composite indexes, Prisma migrations, comprehensive seed data (2 orgs, 5 users, projects, 10+ tasks, assignments, comments). | ⭐ Soft delete (`deleted_at`) on projects/tasks.<br>⭐ PostgreSQL full-text search on task title + description. |
| **Task 02: Auth & RBAC** | bcrypt hashing (cost 12), JWT Access Token (15m), Refresh Token (7d stored in DB), RBAC (`org_admin` vs `member`), strict `org_id` multi-tenant scoping, IP rate limiting (10 req/min). | ⭐ Refresh token rotation.<br>⭐ Logout all devices endpoint. |
| **Task 03: REST API** | Clean Route → Controller → Service → Data separation, full CRUD for Projects & Tasks, filters (status, priority, assignee, due date), pagination (`{ data, total, page, limit }`), Zod validation, uniform error responses. | ⭐ Bulk task status update.<br>⭐ Full-text task search endpoint. |
| **Task 04: Background Jobs** | Redis + BullMQ, non-blocking email assignment job dispatch, email worker, 3 retries with exponential backoff (`1s -> 2s -> 4s`), dead-letter queue, `GET /jobs/:id` status endpoint. | ⭐ Assignment deduplication (5s window).<br>⭐ Global email rate limit (50 emails/min). |
| **Task 05: Testing & Specs** | Unit tests (auth, password, pagination), integration tests (Supertest login, task CRUD, cross-tenant 403 checks), Swagger UI (`/api-docs`), downloadable `postman_collection.json`. | ⭐ Test coverage configuration.<br>⭐ Cross-tenant isolation verification. |

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- Node.js (v20+)
- PostgreSQL (v16+)
- Redis (v7+)

### 1. Clone & Install Dependencies
```bash
git clone <your-repository-url>
cd taskflow-backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure your `DATABASE_URL` and `REDIS_HOST` match your local environment.

### 3. Run Database Migrations & Seed Data
```bash
# Generate Prisma client & apply migrations
npx prisma migrate dev --name init

# Seed database with orgs, users, projects, and tasks
npx prisma db seed
```

### 4. Start Development Servers
Start the Express REST API server:
```bash
npm run dev
```
In a second terminal window, start the BullMQ background email worker:
```bash
npm run worker:dev
```

- **REST API**: `http://localhost:3000/api`
- **Swagger Documentation**: `http://localhost:3000/api-docs`

---

## 🐳 Docker Compose Deployment (Production Readiness)

You can run the entire ecosystem (API, Worker, PostgreSQL, and Redis) with a single Docker Compose command:

```bash
docker-compose up --build
```

This starts four containers:
1. `taskflow_postgres` (PostgreSQL 16)
2. `taskflow_redis` (Redis 7)
3. `taskflow_api` (Express REST Server on port 3000)
4. `taskflow_worker` (BullMQ Email Notification Worker Process)

---

## 📖 API Documentation & Postman Collection

### 1. Interactive Swagger UI
Launch the server and visit:
👉 **`http://localhost:3000/api-docs`**

### 2. Postman Collection
Import `postman_collection.json` located in the root directory directly into Postman. It includes pre-configured environment variables and sample requests for all endpoints.

---

## 🧪 Running Automated Tests

Run the complete Vitest test suite:
```bash
npm test
```

Generate test coverage report:
```bash
npm run test:coverage
```

---

## 📹 Screen Recording & Demo Guide

When creating your video demo for submission, highlight these 5 key flows:
1. **Database & Schema**: Show `prisma/schema.prisma` highlighting multi-tenant `org_id` indexes and soft delete fields.
2. **Authentication & Multi-Tenancy**: Demonstrate `/api/auth/register` and `/api/auth/login`. Show how JWT token attaches `org_id` context.
3. **REST API & Pagination**: Query `/api/tasks?status=in_progress` and `/api/projects` in Swagger UI or Postman showing standard paginated response.
4. **Asynchronous Background Jobs**: Assign a task to a user (`POST /api/tasks/:id/assign`), show that the API responds instantly, and display the worker terminal printing `📧 [MOCK EMAIL SENT]`.
5. **Cross-Tenant Access Test**: Demonstrate that attempting to access another organization's project returns `403 Forbidden` / `404 Not Found`.

---

## 📄 License
ISC License.
