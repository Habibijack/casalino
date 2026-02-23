import type { ErrorHandler } from 'hono';
import { AppError } from '../lib/errors';

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof AppError) {
    return c.json(
      { success: false, error: { code: err.code, message: err.message } },
      { status: err.statusCode },
    );
  }

  console.error('Unhandled error:', err);

  return c.json(
    { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
    { status: 500 },
  );
};
