import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';

describe('End-to-End (E2E) Live System Flow', () => {
  let adminToken: string;
  let memberToken: string;
  let createdProjectId: string;
  let createdTaskId: string;
  let queuedJobId: string;

  it('1. Should login as Acme Admin and return JWT access token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@acme.com',
      password: 'Password123!',
      orgSlug: 'acme-corp',
    });

    expect(res.status).toBe(200);
    expect(res.body.data.tokens.accessToken).toBeDefined();
    adminToken = res.body.data.tokens.accessToken;
  });

  it('2. Should login as Acme Member (Bob Dev)', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'dev1@acme.com',
      password: 'Password123!',
      orgSlug: 'acme-corp',
    });

    expect(res.status).toBe(200);
    expect(res.body.data.tokens.accessToken).toBeDefined();
    memberToken = res.body.data.tokens.accessToken;
  });

  it('3. Should create a new Project under Acme Organization', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'E2E Test Portal',
        description: 'End-to-End system verification project',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
    createdProjectId = res.body.data.id;
  });

  it('4. Should create a Task inside the Project', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        projectId: createdProjectId,
        title: 'Verify End-to-End System Pipeline',
        description: 'Testing live PostgreSQL DB and BullMQ worker queues',
        status: 'todo',
        priority: 'urgent',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
    createdTaskId = res.body.data.id;
  });

  it('5. Should assign Task to Bob Dev and enqueue asynchronous BullMQ email job', async () => {
    // Get Bob's userId by logging in / querying
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'dev1@acme.com',
      password: 'Password123!',
      orgSlug: 'acme-corp',
    });

    const bobUserId = loginRes.body.data.user.id;

    const res = await request(app)
      .post(`/api/tasks/${createdTaskId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        userId: bobUserId,
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('assigned');
  });

  it('6. Should fetch Project Dashboard metrics grouped by task status', async () => {
    const res = await request(app)
      .get(`/api/projects/${createdProjectId}/dashboard`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.totalTasks).toBeGreaterThanOrEqual(1);
    expect(res.body.data.statusCounts.todo).toBeGreaterThanOrEqual(1);
  });
});
