export class AppError extends Error {
  readonly code: string;
  readonly statusCode: number;

  constructor(code: string, message: string, statusCode: number) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
  }

  static unauthorized(message = 'Authentication required'): AppError {
    return new AppError('UNAUTHORIZED', message, 401);
  }

  static forbidden(message = 'Access denied'): AppError {
    return new AppError('FORBIDDEN', message, 403);
  }

  static notFound(entity = 'Resource'): AppError {
    return new AppError('NOT_FOUND', `${entity} not found`, 404);
  }

  static validation(message: string): AppError {
    return new AppError('VALIDATION_ERROR', message, 400);
  }
}
