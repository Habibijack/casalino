import type { ErrorHandler } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { AppError } from '../lib/errors';

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
  if (err instanceof AppError) {
    return c.json(
      { success: false, error: { code: err.code, message: err.message } },
      toStatusCode(err.statusCode),
    );
  }

  console.error('Unhandled error:', err);

  return c.json(
    { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
    500,
  );
};
