import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

/**
 * Middleware to authorize user roles.
 * @param roles - Array of roles allowed to access the route
 */
export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ msg: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: 'Access denied: You do not have the required role' });
    }

    next();
  };
};
