import { describe, it, expect } from 'vitest';
import { AppError } from '../errors';

describe('AppError', () => {
  it('creates an error with custom code, message, statusCode', () => {
    const err = new AppError('CUSTOM', 'Something went wrong', 500);
    expect(err.code).toBe('CUSTOM');
    expect(err.message).toBe('Something went wrong');
    expect(err.statusCode).toBe(500);
    expect(err.name).toBe('AppError');
    expect(err).toBeInstanceOf(Error);
  });

  it('unauthorized() returns 401', () => {
    const err = AppError.unauthorized();
    expect(err.code).toBe('UNAUTHORIZED');
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe('Authentication required');
  });

  it('unauthorized() accepts custom message', () => {
    const err = AppError.unauthorized('Token expired');
    expect(err.message).toBe('Token expired');
  });

  it('forbidden() returns 403', () => {
    const err = AppError.forbidden();
    expect(err.code).toBe('FORBIDDEN');
    expect(err.statusCode).toBe(403);
    expect(err.message).toBe('Access denied');
  });

  it('notFound() returns 404 with entity name', () => {
    const err = AppError.notFound('Listing');
    expect(err.code).toBe('NOT_FOUND');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Listing not found');
  });

  it('notFound() uses "Resource" as default entity', () => {
    const err = AppError.notFound();
    expect(err.message).toBe('Resource not found');
  });

  it('validation() returns 400', () => {
    const err = AppError.validation('Invalid email');
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('Invalid email');
  });

  it('conflict() returns 409', () => {
    const err = AppError.conflict('Email already exists');
    expect(err.code).toBe('CONFLICT');
    expect(err.statusCode).toBe(409);
    expect(err.message).toBe('Email already exists');
  });
});
