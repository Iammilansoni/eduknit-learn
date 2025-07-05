import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: any;
}

/**
 * Middleware to authenticate JWT tokens in requests.
 */
export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Get token from the Authorization header
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    // Extract token
    const token = authHeader.split(' ')[1];

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);

      // Attach user to request object
      req.user = (decoded as any).user;
      next();
    } catch (err) {
      console.error('Token verification error:', err);
      res.status(401).json({ msg: 'Token is not valid' });
    }
  } else {
    // No token provided
    res.status(401).json({ msg: 'No token, authorization denied' });
  }
};
