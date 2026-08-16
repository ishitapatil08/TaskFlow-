# 🎬 TaskFlow Backend — 5-Minute Demo Video Script

Use this exact, structured script while recording your screen with **Loom** (or OBS / Google Screen Recorder).

---

## 🕒 Video Overview
- **Estimated Duration**: 4 to 5 minutes
- **Recording Mode**: Full screen (Browser on Swagger UI + Optional camera bubble)
- **Swagger URL**: `https://taskflow-65nm.onrender.com/api-docs`

---

## 🎙️ Step-by-Step Recording Script

### 0:00 – 0:35 | Introduction
> **What to show**: Swagger UI home page (`https://taskflow-65nm.onrender.com/api-docs`)
>
> **What to say**:
> *"Hello everyone! My name is Ishita Patil, and this is my submission for the Backend Developer assignment — **TaskFlow**.*
>
> *TaskFlow is a production-grade, multi-tenant project management backend built with:*
> - *Node.js, Express, and TypeScript*
> - *PostgreSQL with Prisma ORM*
> - *Redis and BullMQ for asynchronous background email notifications*
> - *Dockerized and deployed live on Render.*
>
> *Let's walk through the end-to-end API demonstration."*

---

### 0:35 – 1:15 | Step 1: User & Organization Registration
> **What to show**: Expand `POST /auth/register` → Click **Try it out**
>
> **Input Data**:
> ```json
> {
>   "email": "sarah.lead@taskflow.com",
>   "password": "Password123!",
>   "name": "Sarah Lead",
>   "orgName": "Nexus Innovations",
>   "orgSlug": "nexus-innovations"
> }
> ```
> Click **Execute**.
>
> **What to say**:
> *"First, we register a new user and organization. In our PostgreSQL database, a Prisma transaction atomically creates the User, the Organization, and assigns this user the `org_admin` role. As you can see, we get a `201 Created` status code with the user details, organization ID, and JWT access and refresh tokens."*

---

### 1:15 – 1:55 | Step 2: Login & Authorize Swagger
> **What to show**: Expand `POST /auth/login` → Click **Try it out**
>
> **Input Data**:
> ```json
> {
>   "email": "sarah.lead@taskflow.com",
>   "password": "Password123!",
>   "orgSlug": "nexus-innovations"
> }
> ```
> Click **Execute**.
>
> **Action**:
> 1. Copy the `accessToken` from the response body.
> 2. Scroll up to the top of Swagger UI.
> 3. Click the green **Authorize** 🔓 button.
> 4. In the Value box, paste the token.
> 5. Click **Authorize**, then **Close**.
>
> **What to say**:
> *"Next, we log in using email, password, and the organization slug for strict tenant isolation. The API authenticates with bcrypt, verifies org membership, and generates a scoped JWT.*
>
> *I'll copy the access token and authorize Swagger UI so that all subsequent requests include the Bearer Authorization header."*

---

### 1:55 – 2:35 | Step 3: Create a Project
> **What to show**: Expand `POST /projects` → Click **Try it out**
>
> **Input Data**:
> ```json
> {
>   "name": "Q3 Cloud Migration",
>   "description": "Migrating core microservices to Kubernetes cluster"
> }
> ```
> Click **Execute**.
>
> **Action**: Copy the returned `id` (e.g. `c068e6fd-08ee-4344-9ec4-bfc80ae59d43`).
>
> **What to say**:
> *"Now we create a new project under our organization. The service automatically scopes this project to `nexus-innovations` based on the authenticated JWT token. Let's copy this generated Project ID."*

---

### 2:35 – 3:30 | Step 4: Create Task & Background Queue Trigger
> **What to show**: Expand `POST /tasks` → Click **Try it out**
>
> **Input Data** *(Paste your copied projectId)*:
> ```json
> {
>   "projectId": "<PASTE_COPIED_PROJECT_ID>",
>   "title": "Configure Redis Cache Layer",
>   "description": "Setup distributed caching with BullMQ worker queue",
>   "priority": "high",
>   "dueDate": "2026-09-15"
> }
> ```
> Click **Execute**.
>
> **Action**: Copy the returned task `id`.
>
> **What to say**:
> *"Here we create a task with `high` priority and a due date. Once created, when a task is assigned, our backend pushes an email notification job into the BullMQ Redis queue with exponential backoff retries and deduplication.*
>
> *Let's now transition this task's status."*

---

### 3:30 – 4:05 | Step 5: Update Task Status & List with Filters
> **What to show**: Expand `PUT /tasks/{id}` → Click **Try it out**
>
> **Input**:
> - `id`: `<PASTE_TASK_ID>`
> - **Body**:
>   ```json
>   {
>     "status": "in_progress"
>   }
>   ```
> Click **Execute**.
>
> **Next**: Expand `GET /tasks` → Click **Try it out** → Enter `status: in_progress` → Click **Execute**.
>
> **What to say**:
> *"We update the task status from `todo` to `in_progress`. When we query `GET /tasks` with filtering and pagination, we get our filtered list of tasks cleanly partitioned by organization."*

---

### 4:05 – 4:40 | Step 6: Real-time Project Dashboard
> **What to show**: Expand `GET /projects/{id}/dashboard` → Click **Try it out**
>
> **Input**:
> - `id`: `<PASTE_COPIED_PROJECT_ID>`
> Click **Execute**.
>
> **What to say**:
> *"Finally, let's view the project dashboard analytics at `GET /projects/:id/dashboard`. It aggregates total tasks, overdue count, and groups task counts by status (`todo`, `in_progress`, `review`, `done`) in real-time."*

---

### 4:40 – 5:00 | Conclusion & Architecture Summary
> **What to show**: Switch to GitHub repository tab `https://github.com/ishitapatil08/TaskFlow-`
>
> **What to say**:
> *"To summarize:*
> - *Layered Clean Architecture (Routes → Controllers → Services → Prisma ORM)*
> - *Robust Security (Argon2/Bcrypt, JWT Access + Rotated Refresh Tokens, Rate Limiting, Helmet, and Zod validation)*
> - *Automated testing with Vitest and containerized deployment with Docker and Render.*
>
> *Thank you very much for your time!"*

---

## 📌 Checklist Before You Press Record:
- [ ] Render Server is active: `https://taskflow-65nm.onrender.com/health`
- [ ] Swagger tab open: `https://taskflow-65nm.onrender.com/api-docs`
- [ ] GitHub tab open: `https://github.com/ishitapatil08/TaskFlow-`
- [ ] Microphone is tested and screen recording is ready.
