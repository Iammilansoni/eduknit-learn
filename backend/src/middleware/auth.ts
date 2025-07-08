import { Request, Response, NextFunction } from 'express';
import { JWTUtils, JWT_CONFIG } from '../config/jwt';

export interface AuthRequest extends Request {
  user?: any;
}

/**
 * Middleware to authenticate JWT tokens in requests.
 * Supports both Authorization header (Bearer token) and HTTP-only cookies.
 */
export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | null = null;

    // Try to get token from Authorization header first
    token = JWTUtils.extractTokenFromHeader(req);

    // If no token in header, try cookies
    if (!token) {
      token = JWTUtils.extractTokenFromCookies(req, JWT_CONFIG.COOKIE.ACCESS_TOKEN_NAME);
    }

    if (!token) {
      res.status(401).json({ 
        success: false,
        message: 'No token, authorization denied' 
      });
      return;
    }

    try {
      // Verify token
      const decoded = JWTUtils.verifyAccessToken(token);

      // Attach user to request object
      req.user = decoded.user;
      next();
    } catch (err: any) {
      console.error('Token verification error:', err);
      
      if (err.name === 'TokenExpiredError') {
        res.status(401).json({ 
          success: false,
          message: 'Token expired',
          code: 'EXPIRED_TOKEN'
        });
      } else {
        res.status(401).json({ 
          success: false,
          message: 'Token is not valid',
          code: 'INVALID_TOKEN'
        });
      }
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error during authentication' 
    });
  }
};
