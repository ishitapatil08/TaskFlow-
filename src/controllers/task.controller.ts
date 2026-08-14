import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service.js';

export class TaskController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user!.orgId;
      const task = await TaskService.createTask(orgId, req.body);
      res.status(201).json({ message: 'Task created successfully', data: task });
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user!.orgId;
      const result = await TaskService.getTasks(orgId, req.query as any);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user!.orgId;
      const task = await TaskService.getTaskById(orgId, req.params.id);
      res.status(200).json({ data: task });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user!.orgId;
      const task = await TaskService.updateTask(orgId, req.params.id, req.body);
      res.status(200).json({ message: 'Task updated successfully', data: task });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user!.orgId;
      await TaskService.deleteTask(orgId, req.params.id);
      res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async assignUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user!.orgId;
      const assignerUserId = req.user!.userId;
      const assignment = await TaskService.assignUser(
        orgId,
        req.params.id,
        req.body.userId,
        assignerUserId
      );
      res.status(200).json({ message: 'User assigned to task successfully', data: assignment });
    } catch (error) {
      next(error);
    }
  }

  static async unassignUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user!.orgId;
      await TaskService.unassignUser(orgId, req.params.id, req.params.userId);
      res.status(200).json({ message: 'User unassigned from task successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async bulkUpdateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user!.orgId;
      const result = await TaskService.bulkUpdateStatus(orgId, req.body.taskIds, req.body.status);
      res.status(200).json({ message: 'Bulk task status updated successfully', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getProjectDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user!.orgId;
      const dashboard = await TaskService.getProjectDashboard(orgId, req.params.id);
      res.status(200).json({ data: dashboard });
    } catch (error) {
      next(error);
    }
  }
}
