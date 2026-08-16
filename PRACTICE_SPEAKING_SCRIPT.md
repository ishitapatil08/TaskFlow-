# 🎙️ TaskFlow — Complete Video Recording & Speaking Script (Word-for-Word Practice Guide)

This document is your **complete practice manual**. It tells you:
1. **What to click on screen** (Visual Action)
2. **What to say aloud** (Word-for-Word Script)
3. **Why this technical decision was made** (Interview Defense points in case interviewers ask)

---

## 📋 Pre-Flight Checklist Before Hitting Record
- [ ] Browser Window 1: **Swagger UI** -> `https://taskflow-65nm.onrender.com/api-docs`
- [ ] Browser Window 2: **GitHub Repository** -> `https://github.com/ishitapatil08/TaskFlow-`
- [ ] Test recording tool (Loom / OBS / Google Drive screen recorder)
- [ ] Make sure audio/microphone is clear and background noise is minimal.

---

## 🎬 Act 1: Introduction & Architecture Overview (0:00 - 0:45)

### 🖥️ On Screen:
Open **Swagger UI** (`https://taskflow-65nm.onrender.com/api-docs`).

### 🗣️ Say Aloud:
> *"Hello everyone! My name is Ishita Patil. Today, I am demonstrating my submission for the Backend Developer assessment — **TaskFlow**, a production-grade, multi-tenant project management REST API.*
>
> *TaskFlow is architected with a strict layered design:*
> - *First, **Node.js, Express, and TypeScript** for type-safe routing and controllers.*
> - *Second, **PostgreSQL with Prisma ORM**, implementing database-level multi-tenancy, soft deletion, and indexing.*
> - *Third, **Redis and BullMQ** for asynchronous background worker queues with automatic retries and deduplication.*
> - *And fourth, **Dockerized deployment on Render** with full OpenAPI and Swagger documentation.*
>
> *Let's now walk through the full lifecycle of the system directly through our interactive Swagger interface."*

---

## 🎬 Act 2: Tenant Isolation & User Registration (0:45 - 1:30)

### 🖥️ On Screen:
1. Click to expand `POST /auth/register`.
2. Click **Try it out**.
3. Replace the request body with:
```json
{
  "email": "sarah.lead@taskflow.com",
  "password": "Password123!",
  "name": "Sarah Lead",
  "orgName": "Nexus Innovations",
  "orgSlug": "nexus-innovations"
}
```
4. Click **Execute**.
5. Scroll down to show the `201 Created` response.

### 🗣️ Say Aloud:
> *"We start with registration. In a multi-tenant platform, tenant onboarding must be atomic.*
>
> *When we execute `POST /auth/register`, our backend runs a Prisma database transaction that does three things simultaneously:*
> 1. *It hashes the password using bcrypt with a salt cost of 12.*
> 2. *It creates the user and the new tenant organization record.*
> 3. *It links the user as an `org_admin` inside the `OrgMember` association table.*
>
> *As we can see on screen, the server returns a `201 Created` status with the user profile, the organization metadata, and a fresh pair of JSON Web Tokens."*

---

## 🎬 Act 3: Authentication, RBAC & Swagger Authorization (1:30 - 2:20)

### 🖥️ On Screen:
1. Click to expand `POST /auth/login`.
2. Click **Try it out**.
3. Paste:
```json
{
  "email": "sarah.lead@taskflow.com",
  "password": "Password123!",
  "orgSlug": "nexus-innovations"
}
```
4. Click **Execute**.
5. In the response, highlight and **Copy the `accessToken` string** (without quotes).
6. Scroll to the top of Swagger. Click the green **Authorize 🔓** button.
7. Paste the token into the value box, click **Authorize**, then click **Close**.

### 🗣️ Say Aloud:
> *"Now let's authenticate. Notice that the login request requires the `orgSlug`. This ensures strict multi-tenant boundaries — preventing users from authenticating into organizations they don't belong to.*
>
> *Upon successful verification, the AuthService signs a short-lived access token with tenant context — including `userId`, `orgId`, and `role` — and stores a hashed refresh token in PostgreSQL for rotation.*
>
> *I will now copy this access token and authorize Swagger UI. All following requests will automatically carry the `Bearer` authorization header."*

---

## 🎬 Act 4: Multi-Tenant Project Creation (2:20 - 3:00)

### 🖥️ On Screen:
1. Click to expand `POST /projects`.
2. Click **Try it out**.
3. Paste:
```json
{
  "name": "Q3 Cloud Migration",
  "description": "Migrating monolithic services to containerized infrastructure"
}
```
4. Click **Execute**.
5. Show the `201 Created` response. **Copy the `id` value** (e.g. `c068e6fd-08ee-4344-9ec4-bfc80ae59d43`).

### 🗣️ Say Aloud:
> *"Next, we create a project using `POST /projects`.*
>
> *Our project service extracts the `orgId` directly from the authenticated JWT token, rather than relying on client input. This prevents cross-tenant spoofing.*
>
> *The project is created with soft-delete enabled, ensuring data retention compliance. Let's copy this generated Project ID for our task management step."*

---

## 🎬 Act 5: Task Management & BullMQ Queue Dispatch (3:00 - 3:55)

### 🖥️ On Screen:
1. Click to expand `POST /tasks`.
2. Click **Try it out**.
3. Paste (inserting your copied Project ID):
```json
{
  "projectId": "<PASTE_COPIED_PROJECT_ID>",
  "title": "Setup Redis & Worker Queue",
  "description": "Configure BullMQ background job processing for email notifications",
  "priority": "high",
  "dueDate": "2026-09-15"
}
```
4. Click **Execute**.
5. Show the `201 Created` response. **Copy the task `id`**.

### 🗣️ Say Aloud:
> *"Now we create a task within our project.*
>
> *Notice our validation schema: `priority` is validated against PostgreSQL enums (`low`, `medium`, `high`, `urgent`), and the project ownership is validated against the user's organization.*
>
> *When a task is assigned to a teammate, our TaskService dispatches an asynchronous job to our BullMQ queue connected to Redis. This keeps HTTP response times under 50 milliseconds while background workers handle email deliveries with exponential backoff and job deduplication.*
>
> *Let's copy the Task ID to update its state."*

---

## 🎬 Act 6: Task State Transitions & Filtered Queries (3:55 - 4:40)

### 🖥️ On Screen:
1. Expand `PUT /tasks/{id}` -> Click **Try it out**.
2. Put your Task ID in `id`.
3. Body:
```json
{
  "status": "in_progress"
}
```
4. Click **Execute** -> Show `200 OK`.
5. Expand `GET /tasks` -> Click **Try it out**.
6. Set query parameter `status` to `in_progress` -> Click **Execute**.

### 🗣️ Say Aloud:
> *"Here we perform a state transition using `PUT /tasks/:id`, moving the status from `todo` to `in_progress`.*
>
> *Next, we query `GET /tasks` using query filters. The API supports pagination, status filters, priority filters, and PostgreSQL full-text search across titles and descriptions — always strictly filtered by `orgId`."*

---

## 🎬 Act 7: Real-Time Project Dashboard Analytics (4:40 - 5:20)

### 🖥️ On Screen:
1. Expand `GET /projects/{id}/dashboard`.
2. Click **Try it out**.
3. Put your Project ID in `id`.
4. Click **Execute** -> Show the aggregated JSON response.

### 🗣️ Say Aloud:
> *"One of the key requirements of TaskFlow is the Project Dashboard metric endpoint.*
>
> *When we call `GET /projects/:id/dashboard`, the backend uses Prisma group-by queries to compute real-time statistics: total task count, overdue tasks, and a breakdown across `todo`, `in_progress`, `review`, and `done` statuses."*

---

## 🎬 Act 8: Codebase Tour & Wrap-Up (5:20 - 6:00)

### 🖥️ On Screen:
Switch tab to your **GitHub Repository** (`https://github.com/ishitapatil08/TaskFlow-`).
Scroll slightly through the file tree (`src/routes`, `src/services`, `src/jobs`, `prisma/schema.prisma`, `Dockerfile`).

### 🗣️ Say Aloud:
> *"To conclude our walkthrough, let's take a quick look at the codebase on GitHub:*
> - *Under `src/`, we follow clean separation of concerns: routes, controllers, services, database client, and validators.*
> - *Under `src/jobs/` and `src/worker.ts`, we have our BullMQ queue producer and consumer.*
> - *Our test suite is written using Vitest with integration tests covering auth, tenant isolation, and task flows.*
> - *And the entire stack is containerized with Docker Compose for local development and Render for production deployment.*
>
> *Thank you very much for reviewing my project!"*

---

## 🎯 Cheat Sheet: Quick Answers for Potential Interview Questions

| Topic | Technical Answer to Give |
|---|---|
| **How is multi-tenancy enforced?** | *"Every database query in the Service layer includes `orgId` from the verified JWT payload. Foreign keys enforce referential integrity and prevent data leaks across organizations."* |
| **How does token rotation work?** | *"When `POST /auth/refresh` is called, the old refresh token is marked `revoked: true` in PostgreSQL, and a new token pair is issued. Replaying an old token results in immediate 401 rejection."* |
| **Why BullMQ over simple cron/timeout?** | *"BullMQ provides persistent Redis job storage, worker concurrency control, exponential backoff retries, and job state tracking that survives server restarts."* |
| **How is performance optimized?** | *"Compound database indexes on `(orgId, status)` and `(orgId, projectId)`, pagination defaults, and rate limiting against brute force attacks."* |
