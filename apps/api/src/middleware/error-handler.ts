import type { ErrorHandler } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { ZodError } from 'zod';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';

const STATUS_MAP: Record<number, ContentfulStatusCode> = {
  400: 400,
  401: 401,
  403: 403,
  404: 404,
  409: 409,
  422: 422,
  429: 429,
  500: 500,
};

function toStatusCode(code: number): ContentfulStatusCode {
  return STATUS_MAP[code] ?? 500;
}

export const errorHandler: ErrorHandler = (err, c) => {
  // Known application errors
  if (err instanceof AppError) {
    return c.json(
      { success: false, error: { code: err.code, message: err.message } },
      toStatusCode(err.statusCode),
    );
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    const firstError = err.errors[0];
    const message = firstError
      ? `${firstError.path.join('.')}: ${firstError.message}`
      : 'Ungueltige Eingabe';

    return c.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message } },
      400,
    );
  }

  // Unknown errors — log and return generic message
  logger.error('unhandled_error', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    path: c.req.path,
    method: c.req.method,
  });

  return c.json(
    { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
    500,
  );
};
