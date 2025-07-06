import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// JWT Configuration
export const JWT_CONFIG = {
  // Access Token Configuration
  ACCESS_TOKEN: {
    SECRET: process.env.JWT_SECRET!,
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
    ALGORITHM: 'HS256' as const,
    ISSUER: process.env.JWT_ISSUER || 'eduknit-learn',
    AUDIENCE: process.env.JWT_AUDIENCE || 'eduknit-learn-users',
  },
  
  // Refresh Token Configuration
  REFRESH_TOKEN: {
    SECRET: process.env.JWT_REFRESH_SECRET!,
    EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    ALGORITHM: 'HS256' as const,
    ISSUER: process.env.JWT_ISSUER || 'eduknit-learn',
    AUDIENCE: process.env.JWT_AUDIENCE || 'eduknit-learn-users',
  },
  
  // Cookie Configuration
  COOKIE: {
    ACCESS_TOKEN_NAME: 'accessToken',
    REFRESH_TOKEN_NAME: 'refreshToken',
    HTTP_ONLY: true,
    SECURE: process.env.NODE_ENV === 'production',
    SAME_SITE: process.env.NODE_ENV === 'production' ? 'strict' as const : 'lax' as const,
    ACCESS_TOKEN_MAX_AGE: 60 * 60 * 1000, // 1 hour
    REFRESH_TOKEN_MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
};

// JWT Token Types
export interface AccessTokenPayload {
  user: {
    id: string;
    role: string;
  };
}

export interface RefreshTokenPayload {
  user: {
    id: string;
    role: string;
  };
}

// JWT Utility Functions
export class JWTUtils {
  /**
   * Generate access token
   */
  static generateAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, JWT_CONFIG.ACCESS_TOKEN.SECRET, {
      expiresIn: JWT_CONFIG.ACCESS_TOKEN.EXPIRES_IN,
      algorithm: JWT_CONFIG.ACCESS_TOKEN.ALGORITHM as jwt.Algorithm,
      issuer: JWT_CONFIG.ACCESS_TOKEN.ISSUER,
      audience: JWT_CONFIG.ACCESS_TOKEN.AUDIENCE,
    });
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: RefreshTokenPayload): string {
    return jwt.sign(payload, JWT_CONFIG.REFRESH_TOKEN.SECRET, {
      expiresIn: JWT_CONFIG.REFRESH_TOKEN.EXPIRES_IN,
      algorithm: JWT_CONFIG.REFRESH_TOKEN.ALGORITHM as jwt.Algorithm,
      issuer: JWT_CONFIG.REFRESH_TOKEN.ISSUER,
      audience: JWT_CONFIG.REFRESH_TOKEN.AUDIENCE,
    });
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, JWT_CONFIG.ACCESS_TOKEN.SECRET, {
      algorithms: [JWT_CONFIG.ACCESS_TOKEN.ALGORITHM as jwt.Algorithm],
      issuer: JWT_CONFIG.ACCESS_TOKEN.ISSUER,
      audience: JWT_CONFIG.ACCESS_TOKEN.AUDIENCE,
    }) as AccessTokenPayload;
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): RefreshTokenPayload {
    return jwt.verify(token, JWT_CONFIG.REFRESH_TOKEN.SECRET, {
      algorithms: [JWT_CONFIG.REFRESH_TOKEN.ALGORITHM as jwt.Algorithm],
      issuer: JWT_CONFIG.REFRESH_TOKEN.ISSUER,
      audience: JWT_CONFIG.REFRESH_TOKEN.AUDIENCE,
    }) as RefreshTokenPayload;
  }

  /**
   * Decode token without verification (for debugging)
   */
  static decodeToken(token: string): any {
    return jwt.decode(token);
  }

  /**
   * Get token expiration time
   */
  static getTokenExpiration(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) return true;
    return expiration < new Date();
  }

  /**
   * Set tokens in HTTP-only cookies
   */
  static setTokensInCookies(
    res: Response, 
    accessToken: string, 
    refreshToken: string
  ): void {
    res.cookie(JWT_CONFIG.COOKIE.ACCESS_TOKEN_NAME, accessToken, {
      httpOnly: JWT_CONFIG.COOKIE.HTTP_ONLY,
      secure: JWT_CONFIG.COOKIE.SECURE,
      sameSite: JWT_CONFIG.COOKIE.SAME_SITE,
      maxAge: JWT_CONFIG.COOKIE.ACCESS_TOKEN_MAX_AGE,
      path: '/',
    });

    res.cookie(JWT_CONFIG.COOKIE.REFRESH_TOKEN_NAME, refreshToken, {
      httpOnly: JWT_CONFIG.COOKIE.HTTP_ONLY,
      secure: JWT_CONFIG.COOKIE.SECURE,
      sameSite: JWT_CONFIG.COOKIE.SAME_SITE,
      maxAge: JWT_CONFIG.COOKIE.REFRESH_TOKEN_MAX_AGE,
      path: '/',
    });
  }

  /**
   * Clear tokens from cookies
   */
  static clearTokensFromCookies(res: Response): void {
    res.clearCookie(JWT_CONFIG.COOKIE.ACCESS_TOKEN_NAME, {
      path: '/',
    });
    res.clearCookie(JWT_CONFIG.COOKIE.REFRESH_TOKEN_NAME, {
      path: '/',
    });
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }

  /**
   * Extract token from cookies
   */
  static extractTokenFromCookies(req: Request, tokenName: string): string | null {
    return req.cookies?.[tokenName] || null;
  }

  /**
   * Generate token pair (access + refresh)
   */
  static generateTokenPair(payload: AccessTokenPayload): {
    accessToken: string;
    refreshToken: string;
  } {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  /**
   * Validate JWT configuration
   */
  static validateConfig(): boolean {
    const requiredSecrets = [
      JWT_CONFIG.ACCESS_TOKEN.SECRET,
      JWT_CONFIG.REFRESH_TOKEN.SECRET,
    ];

    for (const secret of requiredSecrets) {
      if (!secret || secret.length < 32) {
        return false;
      }
    }

    return true;
  }
}

// JWT Error Types
export class JWTError extends Error {
  constructor(
    message: string,
    public code: 'INVALID_TOKEN' | 'EXPIRED_TOKEN' | 'MISSING_TOKEN' | 'INVALID_SIGNATURE'
  ) {
    super(message);
    this.name = 'JWTError';
  }
}

// JWT Middleware Helper
export const createJWTMiddleware = (tokenType: 'access' | 'refresh') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      let token: string | null = null;

      // Try to get token from Authorization header first
      if (tokenType === 'access') {
        token = JWTUtils.extractTokenFromHeader(req);
      }

      // If no token in header, try cookies
      if (!token) {
        const cookieName = tokenType === 'access' 
          ? JWT_CONFIG.COOKIE.ACCESS_TOKEN_NAME 
          : JWT_CONFIG.COOKIE.REFRESH_TOKEN_NAME;
        token = JWTUtils.extractTokenFromCookies(req, cookieName);
      }

      if (!token) {
        res.status(401).json({
          success: false,
          message: 'Access token required',
          code: 'MISSING_TOKEN',
        });
        return;
      }

      // Verify token
      let payload: AccessTokenPayload | RefreshTokenPayload;
      if (tokenType === 'access') {
        payload = JWTUtils.verifyAccessToken(token);
      } else {
        payload = JWTUtils.verifyRefreshToken(token);
      }

      // Add payload to request
      (req as any).user = payload.user;
      next();
    } catch (error: any) {
      if (error instanceof JWTError) {
        res.status(401).json({
          success: false,
          message: error.message,
          code: error.code,
        });
        return;
      }

      if (error.name === 'TokenExpiredError') {
        res.status(401).json({
          success: false,
          message: 'Token expired',
          code: 'EXPIRED_TOKEN',
        });
        return;
      }

      if (error.name === 'JsonWebTokenError') {
        res.status(401).json({
          success: false,
          message: 'Invalid token',
          code: 'INVALID_TOKEN',
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  };
};

// Export default configuration
export default JWT_CONFIG;