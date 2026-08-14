import { prisma } from '../db/prisma.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors.js';
import { getPaginationParams, formatPaginatedResponse } from '../utils/pagination.js';
import { Status, Priority } from '@prisma/client';
import { enqueueTaskAssignmentEmail } from '../jobs/queue.js';

export interface CreateTaskInput {
  projectId: string;
  title: string;
  description?: string;
  status?: Status;
  priority?: Priority;
  dueDate?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: Status;
  priority?: Priority;
  dueDate?: string | null;
}

export interface TaskFilterParams {
  status?: Status;
  priority?: Priority;
  assigneeId?: string;
  projectId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  search?: string;
  page?: string | number;
  limit?: string | number;
}

export class TaskService {
  static async createTask(orgId: string, input: CreateTaskInput) {
    // Verify project exists and belongs to org
    const project = await prisma.project.findFirst({
      where: { id: input.projectId, orgId, deletedAt: null },
    });

    if (!project) {
      throw new NotFoundError('Project not found in organization', 'PROJECT_NOT_FOUND');
    }

    return prisma.task.create({
      data: {
        orgId,
        projectId: input.projectId,
        title: input.title,
        description: input.description,
        status: input.status || Status.todo,
        priority: input.priority || Priority.medium,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
      },
    });
  }

  static async getTasks(orgId: string, filters: TaskFilterParams) {
    const { page, limit, skip } = getPaginationParams(filters.page, filters.limit);

    const where: any = {
      orgId,
      deletedAt: null,
    };

    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.projectId) where.projectId = filters.projectId;

    if (filters.assigneeId) {
      where.assignments = {
        some: { userId: filters.assigneeId },
      };
    }

    if (filters.dueDateFrom || filters.dueDateTo) {
      where.dueDate = {};
      if (filters.dueDateFrom) where.dueDate.gte = new Date(filters.dueDateFrom);
      if (filters.dueDateTo) where.dueDate.lte = new Date(filters.dueDateTo);
    }

    // PostgreSQL Full-text search on title + description
    if (filters.search && filters.search.trim() !== '') {
      const searchTerm = filters.search.trim();
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          project: { select: { id: true, name: true } },
          assignments: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
          _count: { select: { comments: true } },
        },
      }),
      prisma.task.count({ where }),
    ]);

    return formatPaginatedResponse(tasks, total, page, limit);
  }

  static async getTaskById(orgId: string, taskId: string) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, deletedAt: null },
      include: {
        project: { select: { id: true, name: true } },
        assignments: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundError('Task not found', 'TASK_NOT_FOUND');
    }

    if (task.orgId !== orgId) {
      throw new ForbiddenError('Access to task in another organization is denied', 'CROSS_TENANT_ACCESS');
    }

    return task;
  }

  static async updateTask(orgId: string, taskId: string, input: UpdateTaskInput) {
    await this.getTaskById(orgId, taskId); // Multi-tenant validation

    const updateData: any = {};
    if (input.title) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.status) updateData.status = input.status;
    if (input.priority) updateData.priority = input.priority;
    if (input.dueDate !== undefined) {
      updateData.dueDate = input.dueDate ? new Date(input.dueDate) : null;
    }

    return prisma.task.update({
      where: { id: taskId },
      data: updateData,
    });
  }

  static async deleteTask(orgId: string, taskId: string) {
    await this.getTaskById(orgId, taskId); // Multi-tenant validation

    return prisma.task.update({
      where: { id: taskId },
      data: { deletedAt: new Date() },
    });
  }

  static async assignUser(orgId: string, taskId: string, userId: string, assignerUserId: string) {
    const task = await this.getTaskById(orgId, taskId);

    // Requirement: Assigned user MUST belong to the same organization!
    const member = await prisma.orgMember.findUnique({
      where: {
        orgId_userId: {
          orgId,
          userId,
        },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!member) {
      throw new BadRequestError('Target user does not belong to your organization', 'USER_NOT_IN_ORG');
    }

    // Create assignment record (upsert / ignore if exists)
    const assignment = await prisma.taskAssignment.upsert({
      where: {
        taskId_userId: {
          taskId,
          userId,
        },
      },
      create: {
        taskId,
        userId,
      },
      update: {},
    });

    // Enqueue async email notification job without blocking response
    try {
      await enqueueTaskAssignmentEmail({
        taskId: task.id,
        taskTitle: task.title,
        assigneeUserId: member.user.id,
        assigneeEmail: member.user.email,
        assigneeName: member.user.name,
        assignerUserId,
        orgId,
      });
    } catch (err) {
      console.error('Failed to enqueue assignment email job:', err);
    }

    return assignment;
  }

  static async unassignUser(orgId: string, taskId: string, userId: string) {
    await this.getTaskById(orgId, taskId);

    return prisma.taskAssignment.deleteMany({
      where: {
        taskId,
        userId,
      },
    });
  }

  static async bulkUpdateStatus(orgId: string, taskIds: string[], status: Status) {
    // Verify all task IDs belong to the current organization
    const count = await prisma.task.count({
      where: {
        id: { in: taskIds },
        orgId,
        deletedAt: null,
      },
    });

    if (count !== taskIds.length) {
      throw new ForbiddenError('One or more tasks do not belong to your organization', 'CROSS_TENANT_ACCESS');
    }

    return prisma.task.updateMany({
      where: { id: { in: taskIds }, orgId, deletedAt: null },
      data: { status },
    });
  }

  static async getProjectDashboard(orgId: string, projectId: string) {
    // Verify project exists in org
    const project = await prisma.project.findFirst({
      where: { id: projectId, orgId, deletedAt: null },
    });

    if (!project) {
      throw new NotFoundError('Project not found in organization', 'PROJECT_NOT_FOUND');
    }

    const groupedCounts = await prisma.task.groupBy({
      by: ['status'],
      where: {
        projectId,
        orgId,
        deletedAt: null,
      },
      _count: {
        id: true,
      },
    });

    const statusCounts: Record<Status, number> = {
      todo: 0,
      in_progress: 0,
      review: 0,
      done: 0,
    };

    groupedCounts.forEach((group) => {
      statusCounts[group.status] = group._count.id;
    });

    const totalTasks = Object.values(statusCounts).reduce((a, b) => a + b, 0);

    return {
      project: {
        id: project.id,
        name: project.name,
      },
      totalTasks,
      statusCounts,
    };
  }
}
