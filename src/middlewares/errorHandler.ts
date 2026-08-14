import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors.js';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      details: err.details,
    });
  }

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.reduce((acc: Record<string, string>, curr) => {
      const field = curr.path.join('.');
      acc[field] = curr.message;
      return acc;
    }, {});

    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: formattedErrors,
    });
  }

  console.error('Unhandled Server Error:', err);

  return res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
    details: process.env.NODE_ENV === 'development' ? { message: err.message, stack: err.stack } : {},
  });
};
