import { z } from 'zod';
import { Status, Priority } from '@prisma/client';

export const createTaskSchema = z.object({
  body: z.object({
    projectId: z.string().uuid('Invalid project ID'),
    title: z.string().min(1, 'Task title is required'),
    description: z.string().optional(),
    status: z.nativeEnum(Status).optional(),
    priority: z.nativeEnum(Priority).optional(),
    dueDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID'),
  }),
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    status: z.nativeEnum(Status).optional(),
    priority: z.nativeEnum(Priority).optional(),
    dueDate: z.string().optional().nullable(),
  }),
});

export const getTasksQuerySchema = z.object({
  query: z.object({
    status: z.nativeEnum(Status).optional(),
    priority: z.nativeEnum(Priority).optional(),
    assigneeId: z.string().uuid().optional(),
    projectId: z.string().uuid().optional(),
    dueDateFrom: z.string().optional(),
    dueDateTo: z.string().optional(),
    search: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const assignTaskUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID'),
  }),
  body: z.object({
    userId: z.string().uuid('Invalid user ID'),
  }),
});

export const bulkUpdateTaskStatusSchema = z.object({
  body: z.object({
    taskIds: z.array(z.string().uuid()).min(1, 'At least one task ID required'),
    status: z.nativeEnum(Status),
  }),
});
