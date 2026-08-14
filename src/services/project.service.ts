import { prisma } from '../db/prisma.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { getPaginationParams, formatPaginatedResponse } from '../utils/pagination.js';

export interface CreateProjectInput {
  name: string;
  description?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
}

export class ProjectService {
  static async createProject(orgId: string, input: CreateProjectInput) {
    return prisma.project.create({
      data: {
        orgId,
        name: input.name,
        description: input.description,
      },
    });
  }

  static async getProjects(orgId: string, pageQuery?: any, limitQuery?: any) {
    const { page, limit, skip } = getPaginationParams(pageQuery, limitQuery);

    const where = {
      orgId,
      deletedAt: null,
    };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { tasks: { where: { deletedAt: null } } },
          },
        },
      }),
      prisma.project.count({ where }),
    ]);

    return formatPaginatedResponse(projects, total, page, limit);
  }

  static async getProjectById(orgId: string, projectId: string) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
      },
      include: {
        tasks: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          include: {
            assignments: {
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundError('Project not found', 'PROJECT_NOT_FOUND');
    }

    // Strict multi-tenant authorization check
    if (project.orgId !== orgId) {
      throw new ForbiddenError('Access to project in another organization is denied', 'CROSS_TENANT_ACCESS');
    }

    return project;
  }

  static async updateProject(orgId: string, projectId: string, input: UpdateProjectInput) {
    await this.getProjectById(orgId, projectId); // Ensures org scoping check

    return prisma.project.update({
      where: { id: projectId },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
      },
    });
  }

  static async deleteProject(orgId: string, projectId: string) {
    await this.getProjectById(orgId, projectId); // Ensures org scoping check

    // Soft delete project and associated tasks in transaction
    return prisma.$transaction(async (tx) => {
      const now = new Date();
      await tx.task.updateMany({
        where: { projectId, orgId, deletedAt: null },
        data: { deletedAt: now },
      });

      return tx.project.update({
        where: { id: projectId },
        data: { deletedAt: now },
      });
    });
  }
}
