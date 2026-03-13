import { describe, it, expect } from 'vitest';
import { formatLineError } from '../../src/utils/error.js';

describe('formatLineError', () => {
  it('returns message for a regular Error without statusCode', () => {
    const error = new Error('something broke');
    expect(formatLineError(error)).toBe('something broke');
  });

  it('returns HTTP status for a LINE API error with statusCode', () => {
    const error = Object.assign(new Error('Bad Request'), { statusCode: 400 });
    expect(formatLineError(error)).toBe('LINE API error (HTTP 400)');
  });

  it('returns HTTP status for 401 Unauthorized', () => {
    const error = Object.assign(new Error('Unauthorized'), { statusCode: 401 });
    expect(formatLineError(error)).toBe('LINE API error (HTTP 401)');
  });

  it('returns "Unknown error" for non-Error values', () => {
    expect(formatLineError('string error')).toBe('Unknown error');
    expect(formatLineError(42)).toBe('Unknown error');
    expect(formatLineError(null)).toBe('Unknown error');
    expect(formatLineError(undefined)).toBe('Unknown error');
  });

  it('ignores statusCode if it is not a number', () => {
    const error = Object.assign(new Error('bad'), { statusCode: 'not a number' });
    expect(formatLineError(error)).toBe('bad');
  });
});
