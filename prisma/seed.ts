import { PrismaClient, Status, Priority, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Database Seeding...');

  // Clean existing data
  await prisma.comment.deleteMany({});
  await prisma.taskAssignment.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.orgMember.deleteMany({});
  await prisma.organization.deleteMany({});
  await prisma.user.deleteMany({});

  // Hash password with cost factor 12
  const passwordHash = await bcrypt.hash('Password123!', 12);

  // 1. Create Users
  const user1 = await prisma.user.create({
    data: { email: 'admin@acme.com', name: 'Alice Admin', passwordHash },
  });
  const user2 = await prisma.user.create({
    data: { email: 'dev1@acme.com', name: 'Bob Dev', passwordHash },
  });
  const user3 = await prisma.user.create({
    data: { email: 'dev2@acme.com', name: 'Charlie Tester', passwordHash },
  });
  const user4 = await prisma.user.create({
    data: { email: 'admin@stark.com', name: 'Tony Stark', passwordHash },
  });
  const user5 = await prisma.user.create({
    data: { email: 'dev@stark.com', name: 'Peter Parker', passwordHash },
  });

  console.log('✅ Created 5 users');

  // 2. Create 2 Organizations
  const org1 = await prisma.organization.create({
    data: { name: 'Acme Corporation', slug: 'acme-corp' },
  });
  const org2 = await prisma.organization.create({
    data: { name: 'Stark Tech', slug: 'stark-tech' },
  });

  console.log('✅ Created 2 organizations');

  // 3. Create Organization Memberships with Roles
  await prisma.orgMember.createMany({
    data: [
      { orgId: org1.id, userId: user1.id, role: Role.org_admin },
      { orgId: org1.id, userId: user2.id, role: Role.member },
      { orgId: org1.id, userId: user3.id, role: Role.member },
      { orgId: org2.id, userId: user4.id, role: Role.org_admin },
      { orgId: org2.id, userId: user5.id, role: Role.member },
    ],
  });

  console.log('✅ Created organization memberships with RBAC roles');

  // 4. Create Projects
  const project1 = await prisma.project.create({
    data: {
      orgId: org1.id,
      name: 'Acme Platform Redesign',
      description: 'Overhaul main web portal UI and backend infrastructure',
    },
  });
  const project2 = await prisma.project.create({
    data: {
      orgId: org1.id,
      name: 'Mobile App V2',
      description: 'React Native iOS and Android mobile app update',
    },
  });
  const project3 = await prisma.project.create({
    data: {
      orgId: org2.id,
      name: 'Jarvis Protocol',
      description: 'Next generation autonomous defense & assistant AI system',
    },
  });

  console.log('✅ Created 3 projects');

  // 5. Create 10+ Tasks across projects
  const tasksData = [
    {
      projectId: project1.id,
      orgId: org1.id,
      title: 'Design Database Schema',
      description: 'Model PostgreSQL schema with proper indexes, soft deletes, and multi-tenant keys',
      status: Status.done,
      priority: Priority.urgent,
      dueDate: new Date(Date.now() + 86400000 * 2),
    },
    {
      projectId: project1.id,
      orgId: org1.id,
      title: 'Implement JWT Auth & Refresh Tokens',
      description: 'Build registration, login, token rotation, and RBAC middleware',
      status: Status.in_progress,
      priority: Priority.high,
      dueDate: new Date(Date.now() + 86400000 * 4),
    },
    {
      projectId: project1.id,
      orgId: org1.id,
      title: 'Setup BullMQ Queue Worker',
      description: 'Configure Redis connection, email assignment worker, retries, and rate limiting',
      status: Status.todo,
      priority: Priority.high,
      dueDate: new Date(Date.now() + 86400000 * 6),
    },
    {
      projectId: project1.id,
      orgId: org1.id,
      title: 'Write Integration Tests',
      description: 'Cover login flow, CRUD operations, and cross-tenant access restriction checks',
      status: Status.review,
      priority: Priority.medium,
      dueDate: new Date(Date.now() + 86400000 * 7),
    },
    {
      projectId: project1.id,
      orgId: org1.id,
      title: 'Docker Compose Setup',
      description: 'Containerize Express API, BullMQ worker, PostgreSQL, and Redis',
      status: Status.todo,
      priority: Priority.low,
      dueDate: new Date(Date.now() + 86400000 * 10),
    },
    {
      projectId: project2.id,
      orgId: org1.id,
      title: 'Mobile Push Notifications',
      description: 'Integrate FCM for real-time task assignment alerts',
      status: Status.in_progress,
      priority: Priority.medium,
      dueDate: new Date(Date.now() + 86400000 * 5),
    },
    {
      projectId: project2.id,
      orgId: org1.id,
      title: 'Offline Mode Synchronization',
      description: 'Support local SQLite cache on mobile client with background sync',
      status: Status.todo,
      priority: Priority.low,
      dueDate: new Date(Date.now() + 86400000 * 12),
    },
    {
      projectId: project3.id,
      orgId: org2.id,
      title: 'Mark 85 Armor Diagnostic API',
      description: 'Expose telemetry metrics endpoint for Stark defense systems',
      status: Status.done,
      priority: Priority.urgent,
      dueDate: new Date(Date.now() + 86400000 * 1),
    },
    {
      projectId: project3.id,
      orgId: org2.id,
      title: 'Neural Link Processing Module',
      description: 'Implement real-time neural command queues with Redis pub/sub',
      status: Status.in_progress,
      priority: Priority.high,
      dueDate: new Date(Date.now() + 86400000 * 3),
    },
    {
      projectId: project3.id,
      orgId: org2.id,
      title: 'Security Audit & Vulnerability Scan',
      description: 'Audit system API against OWASP top 10 vulnerabilities',
      status: Status.review,
      priority: Priority.urgent,
      dueDate: new Date(Date.now() + 86400000 * 5),
    },
  ];

  const createdTasks = [];
  for (const taskData of tasksData) {
    const task = await prisma.task.create({ data: taskData });
    createdTasks.push(task);
  }

  console.log(`✅ Created ${createdTasks.length} tasks across projects`);

  // 6. Assign Users to Tasks
  await prisma.taskAssignment.createMany({
    data: [
      { taskId: createdTasks[0].id, userId: user2.id },
      { taskId: createdTasks[1].id, userId: user2.id },
      { taskId: createdTasks[2].id, userId: user3.id },
      { taskId: createdTasks[3].id, userId: user3.id },
      { taskId: createdTasks[7].id, userId: user5.id },
      { taskId: createdTasks[8].id, userId: user5.id },
    ],
  });

  console.log('✅ Created task assignments');

  // 7. Add Sample Comments
  await prisma.comment.createMany({
    data: [
      {
        taskId: createdTasks[0].id,
        userId: user1.id,
        content: 'Database schema approved. Please make sure indexes are covered.',
      },
      {
        taskId: createdTasks[0].id,
        userId: user2.id,
        content: 'Added indexes for org_id, status, priority, and due_date.',
      },
      {
        taskId: createdTasks[7].id,
        userId: user4.id,
        content: 'Telemetry API looks fast and responsive. Good work Peter!',
      },
    ],
  });

  console.log('✅ Created sample task comments');
  console.log('🚀 Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
