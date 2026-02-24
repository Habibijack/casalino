import { describe, it, expect } from 'vitest';
import { buildCursorResult, requireRole } from '../query-helpers';
import { AppError } from '../errors';

describe('buildCursorResult', () => {
  it('returns empty items with no nextCursor for empty rows', () => {
    const result = buildCursorResult([], 10, 0);
    expect(result.items).toEqual([]);
    expect(result.nextCursor).toBeNull();
    expect(result.totalCount).toBe(0);
  });

  it('returns all items when rows <= limit (no hasMore)', () => {
    const rows = [
      { id: 'a', name: 'Alice' },
      { id: 'b', name: 'Bob' },
    ];
    const result = buildCursorResult(rows, 5, 10);
    expect(result.items).toHaveLength(2);
    expect(result.nextCursor).toBeNull();
    expect(result.totalCount).toBe(10);
  });

  it('returns items at exact limit with no nextCursor', () => {
    const rows = [
      { id: 'a', name: 'Alice' },
      { id: 'b', name: 'Bob' },
    ];
    const result = buildCursorResult(rows, 2, 2);
    expect(result.items).toHaveLength(2);
    expect(result.nextCursor).toBeNull();
  });

  it('slices to limit and returns nextCursor when rows > limit', () => {
    const rows = [
      { id: 'a', name: 'Alice' },
      { id: 'b', name: 'Bob' },
      { id: 'c', name: 'Charlie' },
    ];
    const result = buildCursorResult(rows, 2, 5);
    expect(result.items).toHaveLength(2);
    expect(result.nextCursor).toBe('b');
    expect(result.totalCount).toBe(5);
  });

  it('uses last item id as nextCursor', () => {
    const rows = [
      { id: 'x1', val: 1 },
      { id: 'x2', val: 2 },
      { id: 'x3', val: 3 },
      { id: 'x4', val: 4 },
    ];
    const result = buildCursorResult(rows, 3, 10);
    expect(result.items).toHaveLength(3);
    expect(result.nextCursor).toBe('x3');
  });
});

describe('requireRole', () => {
  it('does not throw when role is in allowed list', () => {
    expect(() => requireRole('admin', 'admin', 'editor')).not.toThrow();
    expect(() => requireRole('editor', 'admin', 'editor')).not.toThrow();
    expect(() => requireRole('viewer', 'viewer')).not.toThrow();
  });

  it('throws AppError.forbidden when role is not allowed', () => {
    expect(() => requireRole('viewer', 'admin', 'editor')).toThrow(AppError);
    try {
      requireRole('viewer', 'admin');
    } catch (e) {
      expect(e).toBeInstanceOf(AppError);
      const appError = e as AppError;
      expect(appError.statusCode).toBe(403);
      expect(appError.code).toBe('FORBIDDEN');
    }
  });

  it('works with single allowed role', () => {
    expect(() => requireRole('admin', 'admin')).not.toThrow();
    expect(() => requireRole('editor', 'admin')).toThrow();
  });
});
