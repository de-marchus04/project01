/**
 * Tests for /api/auth/register rate limiting and Zod validation logic.
 * These tests exercise the schema and rate-limiter in isolation.
 */

import { z } from 'zod';

// Inline same schema from route.ts to test it independently
const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Логин должен содержать минимум 3 символа')
    .max(32, 'Логин не должен превышать 32 символа')
    .regex(/^[a-zA-Z0-9_]+$/, 'Логин может содержать только буквы, цифры и _'),
  password: z
    .string()
    .min(6, 'Пароль должен содержать минимум 6 символов')
    .max(72, 'Пароль не должен превышать 72 символа'),
});

describe('registerSchema validation', () => {
  it('accepts valid input', () => {
    const result = registerSchema.safeParse({ username: 'john_doe', password: 'secret123' });
    expect(result.success).toBe(true);
  });

  it('rejects username shorter than 3 chars', () => {
    const result = registerSchema.safeParse({ username: 'ab', password: 'secret123' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch('минимум 3');
  });

  it('rejects username with special chars', () => {
    const result = registerSchema.safeParse({ username: 'user@name!', password: 'secret123' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch('буквы');
  });

  it('rejects password shorter than 6 chars', () => {
    const result = registerSchema.safeParse({ username: 'validUser', password: 'abc' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch('минимум 6');
  });

  it('rejects empty username', () => {
    const result = registerSchema.safeParse({ username: '', password: 'secret123' });
    expect(result.success).toBe(false);
  });

  it('rejects missing fields', () => {
    const result = registerSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// Rate limiter logic test
describe('checkRateLimit', () => {
  const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
  const RATE_LIMIT_MAX = 5;
  const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

  function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry || now > entry.resetAt) {
      rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
      return true;
    }
    if (entry.count >= RATE_LIMIT_MAX) return false;
    entry.count += 1;
    return true;
  }

  beforeEach(() => rateLimitMap.clear());

  it('allows first 5 requests', () => {
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit('1.2.3.4')).toBe(true);
    }
  });

  it('blocks 6th request from same IP', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('1.2.3.5');
    expect(checkRateLimit('1.2.3.5')).toBe(false);
  });

  it('different IPs are independent', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('10.0.0.1');
    expect(checkRateLimit('10.0.0.2')).toBe(true);
  });
});
