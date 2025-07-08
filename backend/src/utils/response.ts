import { Response } from 'express';

/**
 * Standardized API Response Utilities
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any[];
  };
  timestamp: string;
  path?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class ResponseHandler {
  /**
   * Send success response
   */
  static success<T>(
    res: Response,
    data?: T,
    message: string = 'Operation successful',
    statusCode: number = 200
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
      path: res.req.originalUrl
    };

    res.status(statusCode).json(response);
  }

  /**
   * Send error response
   */
  static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: any[]
  ): void {
    const response: ApiResponse = {
      success: false,
      error: {
        code: code || 'INTERNAL_ERROR',
        message,
        ...(details && { details })
      },
      timestamp: new Date().toISOString(),
      path: res.req.originalUrl
    };

    res.status(statusCode).json(response);
  }

  /**
   * Send paginated response
   */
  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message: string = 'Data retrieved successfully'
  ): void {
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const response: PaginatedResponse<T> = {
      success: true,
      data,
      message,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev
      },
      timestamp: new Date().toISOString(),
      path: res.req.originalUrl
    };

    res.status(200).json(response);
  }

  /**
   * Send created response
   */
  static created<T>(
    res: Response,
    data: T,
    message: string = 'Resource created successfully'
  ): void {
    this.success(res, data, message, 201);
  }

  /**
   * Send no content response
   */
  static noContent(res: Response): void {
    res.status(204).send();
  }

  /**
   * Send validation error response
   */
  static validationError(
    res: Response,
    message: string = 'Validation failed',
    details: any[] = []
  ): void {
    this.error(res, message, 400, 'VALIDATION_ERROR', details);
  }

  /**
   * Send authentication error response
   */
  static authenticationError(
    res: Response,
    message: string = 'Authentication failed'
  ): void {
    this.error(res, message, 401, 'AUTHENTICATION_ERROR');
  }

  /**
   * Send authorization error response
   */
  static authorizationError(
    res: Response,
    message: string = 'Insufficient permissions'
  ): void {
    this.error(res, message, 403, 'AUTHORIZATION_ERROR');
  }

  /**
   * Send not found error response
   */
  static notFound(
    res: Response,
    resource: string = 'Resource'
  ): void {
    this.error(res, `${resource} not found`, 404, 'NOT_FOUND');
  }

  /**
   * Send conflict error response
   */
  static conflict(
    res: Response,
    message: string = 'Resource conflict'
  ): void {
    this.error(res, message, 409, 'CONFLICT');
  }

  /**
   * Send rate limit error response
   */
  static rateLimit(
    res: Response,
    message: string = 'Too many requests'
  ): void {
    this.error(res, message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

// Export commonly used response methods with proper binding
export const success = ResponseHandler.success.bind(ResponseHandler);
export const error = ResponseHandler.error.bind(ResponseHandler);
export const paginated = ResponseHandler.paginated.bind(ResponseHandler);
export const created = ResponseHandler.created.bind(ResponseHandler);
export const noContent = ResponseHandler.noContent.bind(ResponseHandler);
export const validationError = ResponseHandler.validationError.bind(ResponseHandler);
export const authenticationError = ResponseHandler.authenticationError.bind(ResponseHandler);
export const authorizationError = ResponseHandler.authorizationError.bind(ResponseHandler);
export const notFound = ResponseHandler.notFound.bind(ResponseHandler);
export const conflict = ResponseHandler.conflict.bind(ResponseHandler);
export const rateLimit = ResponseHandler.rateLimit.bind(ResponseHandler);

// Additional exports for backward compatibility
export const serverError = (res: Response, message: string = 'Internal server error') => {
  ResponseHandler.error(res, message, 500, 'INTERNAL_SERVER_ERROR');
};

export const forbidden = (res: Response, message: string = 'Access forbidden') => {
  ResponseHandler.error(res, message, 403, 'FORBIDDEN');
}; 