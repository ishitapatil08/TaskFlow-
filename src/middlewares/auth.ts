import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or malformed Authorization header', 'UNAUTHORIZED');
  }

  const token = authHeader.substring(7);
  const payload = verifyAccessToken(token);

  req.user = payload;
  next();
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required', 'UNAUTHORIZED');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError(
        `Action requires one of the following roles: ${allowedRoles.join(', ')}`,
        'FORBIDDEN_ROLE'
      );
    }

    next();
  };
};
