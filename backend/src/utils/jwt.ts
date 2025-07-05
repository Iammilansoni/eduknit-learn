import type { Request, Response, NextFunction } from 'express';

// Re-export from the comprehensive JWT configuration
export * from '../config/jwt';

// Maintain backward compatibility with existing interfaces
export interface JWTPayload {
  user: {
    id: string;
    role: string;
  };
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// Re-export commonly used functions for backward compatibility
import {
  JWTUtils,
  JWT_CONFIG,
  JWTError,
  createJWTMiddleware,
  AccessTokenPayload,
  RefreshTokenPayload
} from '../config/jwt';

// Export individual functions as standalone exports for backward compatibility
export const generateAccessToken = JWTUtils.generateAccessToken.bind(JWTUtils);
export const generateRefreshToken = JWTUtils.generateRefreshToken.bind(JWTUtils);
export const verifyAccessToken = JWTUtils.verifyAccessToken.bind(JWTUtils);
export const verifyRefreshToken = JWTUtils.verifyRefreshToken.bind(JWTUtils);
export const setTokensInCookies = JWTUtils.setTokensInCookies.bind(JWTUtils);
export const clearTokensFromCookies = JWTUtils.clearTokensFromCookies.bind(JWTUtils);
export const extractTokenFromHeader = JWTUtils.extractTokenFromHeader.bind(JWTUtils);
export const extractTokenFromCookies = JWTUtils.extractTokenFromCookies.bind(JWTUtils);
export const generateTokenPair = JWTUtils.generateTokenPair.bind(JWTUtils);
export const isTokenExpired = JWTUtils.isTokenExpired.bind(JWTUtils);
export const getTokenExpiration = JWTUtils.getTokenExpiration.bind(JWTUtils);
export const decodeToken = JWTUtils.decodeToken.bind(JWTUtils);
export const validateConfig = JWTUtils.validateConfig.bind(JWTUtils);

// Re-export other items
export { JWTUtils, JWT_CONFIG, JWTError, createJWTMiddleware, AccessTokenPayload, RefreshTokenPayload };

// Authentication middleware (enhanced version)
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Access token required'
    });
    return;
  }

  try {
    const payload = JWTUtils.verifyAccessToken(token);
    (req as any).user = payload.user;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Token expired',
        code: 'EXPIRED_TOKEN'
      });
      return;
    }

    res.status(403).json({
      success: false,
      message: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
    return;
  }
};

// Role-based authorization middleware
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    if (!roles.includes(user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
      return;
    }

    next();
  };
};

// Admin-only middleware
export const requireAdmin = authorizeRoles('admin');

// Student-only middleware
export const requireStudent = authorizeRoles('student');

// User or Admin middleware
export const requireUserOrAdmin = authorizeRoles('user', 'admin');

// Student or Admin middleware
export const requireStudentOrAdmin = authorizeRoles('student', 'admin');

// Any authenticated user middleware
export const requireAuthenticated = authorizeRoles('admin', 'user', 'student', 'visitor');
