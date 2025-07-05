/**
 * Custom Error Classes for API Error Handling
 */

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public details: any[];

  constructor(message: string, details: any[] = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500, 'DATABASE_ERROR');
  }
}

export class EmailError extends AppError {
  constructor(message: string = 'Email service error') {
    super(message, 500, 'EMAIL_ERROR');
  }
}

export class JWTError extends AppError {
  constructor(message: string, code: 'INVALID_TOKEN' | 'EXPIRED_TOKEN' | 'MISSING_TOKEN' = 'INVALID_TOKEN') {
    super(message, 401, code);
  }
}

// Error handler utility
export const handleError = (error: any) => {
  if (error instanceof AppError) {
    return error;
  }

  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    const details = Object.values(error.errors).map((err: any) => ({
      field: err.path,
      message: err.message
    }));
    return new ValidationError('Validation failed', details);
  }

  // Handle Mongoose duplicate key errors
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return new ConflictError(`${field} already exists`);
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return new JWTError('Invalid token', 'INVALID_TOKEN');
  }

  if (error.name === 'TokenExpiredError') {
    return new JWTError('Token expired', 'EXPIRED_TOKEN');
  }

  // Handle other known errors
  if (error.name === 'CastError') {
    return new ValidationError('Invalid ID format');
  }

  // Default to internal server error
  return new AppError('Internal server error', 500);
}; 