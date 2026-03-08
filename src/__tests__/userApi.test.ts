/**
 * Tests for userApi: getOrders, addOrder (auth checks, price verification).
 * Uses mocked Prisma client and auth.
 */

jest.mock('@/shared/lib/prisma', () => ({
  prisma: {
    order: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: { findFirst: jest.fn() },
    course: { findUnique: jest.fn() },
    consultation: { findUnique: jest.fn() },
    tour: { findUnique: jest.fn() },
    promoCode: { findUnique: jest.fn() },
  },
}));

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('@/shared/api/emailService', () => ({
  emailService: {
    sendEmail: jest.fn().mockResolvedValue({}),
    sendOrderConfirmation: jest.fn().mockResolvedValue({}),
    sendAdminOrderNotification: jest.fn().mockResolvedValue({}),
  },
}));

import { prisma } from '@/shared/lib/prisma';
import { auth } from '@/auth';
import { getOrders } from '@/shared/api/userApi';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockAuth = auth as jest.Mock;

describe('getOrders', () => {
  beforeEach(() => jest.clearAllMocks());

  it('throws ACCESS_DENIED for non-admin users', async () => {
    mockAuth.mockResolvedValue({ user: { role: 'USER' } });
    await expect(getOrders()).rejects.toThrow('ACCESS_DENIED');
  });

  it('throws ACCESS_DENIED for unauthenticated', async () => {
    mockAuth.mockResolvedValue(null);
    await expect(getOrders()).rejects.toThrow('ACCESS_DENIED');
  });

  it('returns mapped orders for admin', async () => {
    mockAuth.mockResolvedValue({ user: { role: 'ADMIN' } });
    (mockPrisma.order.findMany as jest.Mock).mockResolvedValue([
      {
        id: 'o1',
        productName: 'Yoga Course',
        amount: 99.99,
        status: 'PENDING',
        createdAt: new Date('2025-06-15'),
        itemId: 'c1',
        itemType: 'COURSE',
        user: { username: 'alice' },
        guestName: null,
        userId: 'u1',
        notified: false,
      },
      {
        id: 'o2',
        productName: null,
        amount: 50,
        status: 'COMPLETED',
        createdAt: new Date('2025-06-14'),
        itemId: 't1',
        itemType: 'TOUR',
        user: null,
        guestName: 'Guest Bob',
        userId: null,
        notified: true,
      },
    ]);
    const result = await getOrders();
    expect(result).toHaveLength(2);
    expect(result[0].productName).toBe('Yoga Course');
    expect(result[0].status).toBe('PENDING');
    expect(result[0].customerName).toBe('alice');
    expect(result[1].productName).toBe('Product (TOUR)');
    expect(result[1].status).toBe('COMPLETED');
    expect(result[1].customerName).toBe('Guest Bob');
  });

  it('returns empty array when no orders', async () => {
    mockAuth.mockResolvedValue({ user: { role: 'ADMIN' } });
    (mockPrisma.order.findMany as jest.Mock).mockResolvedValue([]);
    const result = await getOrders();
    expect(result).toEqual([]);
  });
});
