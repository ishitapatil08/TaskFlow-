import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services/project.service.js';

export class ProjectController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user!.orgId;
      const project = await ProjectService.createProject(orgId, req.body);
      res.status(201).json({ message: 'Project created successfully', data: project });
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user!.orgId;
      const result = await ProjectService.getProjects(orgId, req.query.page, req.query.limit);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user!.orgId;
      const project = await ProjectService.getProjectById(orgId, req.params.id);
      res.status(200).json({ data: project });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user!.orgId;
      const project = await ProjectService.updateProject(orgId, req.params.id, req.body);
      res.status(200).json({ message: 'Project updated successfully', data: project });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user!.orgId;
      await ProjectService.deleteProject(orgId, req.params.id);
      res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
