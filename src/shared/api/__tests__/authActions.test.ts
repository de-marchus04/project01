/**
 * Tests for authActions: changePassword and updateMyProfile.
 * Uses mocked Prisma client.
 */

jest.mock('@/shared/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('next/headers', () => ({
  headers: jest.fn().mockResolvedValue({ get: () => '127.0.0.1' }),
}));

jest.mock('@/shared/lib/rateLimit', () => ({
  rateLimit: jest.fn().mockResolvedValue({ success: true }),
}));

import { prisma } from '@/shared/lib/prisma';
import bcrypt from 'bcryptjs';
import { auth } from '@/auth';
import { changePassword, updateMyProfile } from '@/shared/api/authActions';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockAuth = auth as jest.Mock;

describe('changePassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: authenticated as the user being changed
    mockAuth.mockResolvedValue({ user: { username: 'ghost', role: 'USER' } });
  });

  it('returns error if user not found', async () => {
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    const result = await changePassword('ghost', 'old', 'new');
    expect(result.success).toBe(false);
    expect(result.error).toBe('USER_NOT_FOUND');
  });

  it("returns error if old password doesn't match", async () => {
    mockAuth.mockResolvedValue({ user: { username: 'user', role: 'USER' } });
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({ username: 'user', passwordHash: 'hash' });
    (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);
    const result = await changePassword('user', 'wrong', 'new');
    expect(result.success).toBe(false);
    expect(result.error).toBe('WRONG_PASSWORD');
  });

  it('returns success on valid password change', async () => {
    mockAuth.mockResolvedValue({ user: { username: 'user', role: 'USER' } });
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({ username: 'user', passwordHash: 'hash' });
    (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);
    (mockBcrypt.hash as jest.Mock).mockResolvedValue('newHash');
    (mockPrisma.user.update as jest.Mock).mockResolvedValue({});
    const result = await changePassword('user', 'correct', 'newpass');
    expect(result.success).toBe(true);
    expect(mockPrisma.user.update).toHaveBeenCalledWith(expect.objectContaining({ data: { passwordHash: 'newHash' } }));
  });
});

describe('updateMyProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.mockResolvedValue({ user: { username: 'user', role: 'USER' } });
  });

  it('updates name and email', async () => {
    (mockPrisma.user.update as jest.Mock).mockResolvedValue({});
    const result = await updateMyProfile('user', { name: 'Иван', email: 'ivan@test.com' });
    expect(result.success).toBe(true);
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ name: 'Иван', email: 'ivan@test.com' }) }),
    );
  });

  it('sets empty email as null', async () => {
    (mockPrisma.user.update as jest.Mock).mockResolvedValue({});
    const result = await updateMyProfile('user', { email: '' });
    expect(result.success).toBe(true);
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ email: null }) }),
    );
  });

  it('returns error on DB failure', async () => {
    (mockPrisma.user.update as jest.Mock).mockRejectedValue(new Error('DB error'));
    const result = await updateMyProfile('user', { name: 'Test' });
    expect(result.success).toBe(false);
  });
});
