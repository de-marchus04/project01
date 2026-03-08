/**
 * Tests for reviewApi: getItemReviews, upsertReview, deleteReview.
 * Uses mocked Prisma client and auth.
 */

jest.mock('@/shared/lib/prisma', () => ({
  prisma: {
    review: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

import { prisma } from '@/shared/lib/prisma';
import { auth } from '@/auth';
import { getItemReviews, upsertReview, deleteReview, getUserReview } from '@/shared/api/reviewApi';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockAuth = auth as jest.Mock;

describe('getItemReviews', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns empty reviews and zero stats for no reviews', async () => {
    (mockPrisma.review.findMany as jest.Mock).mockResolvedValue([]);
    const result = await getItemReviews('course-1', 'COURSE');
    expect(result.reviews).toHaveLength(0);
    expect(result.stats.total).toBe(0);
    expect(result.stats.average).toBe(0);
  });

  it('calculates average and distribution correctly', async () => {
    (mockPrisma.review.findMany as jest.Mock).mockResolvedValue([
      {
        id: 'r1',
        userId: 'u1',
        itemId: 'c1',
        itemType: 'COURSE',
        rating: 5,
        text: 'Great',
        createdAt: new Date(),
        user: { username: 'alice', avatar: null },
      },
      {
        id: 'r2',
        userId: 'u2',
        itemId: 'c1',
        itemType: 'COURSE',
        rating: 3,
        text: null,
        createdAt: new Date(),
        user: { username: 'bob', avatar: null },
      },
    ]);
    const result = await getItemReviews('c1', 'COURSE');
    expect(result.reviews).toHaveLength(2);
    expect(result.stats.total).toBe(2);
    expect(result.stats.average).toBe(4); // (5+3)/2 = 4.0
    expect(result.stats.distribution[5]).toBe(1);
    expect(result.stats.distribution[3]).toBe(1);
    expect(result.stats.distribution[1]).toBe(0);
  });
});

describe('upsertReview', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns error when not authenticated', async () => {
    mockAuth.mockResolvedValue(null);
    const result = await upsertReview('c1', 'COURSE', 5, 'Great!');
    expect(result.success).toBe(false);
  });

  it('returns error for invalid rating', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1' } });
    const result = await upsertReview('c1', 'COURSE', 6);
    expect(result.success).toBe(false);
  });

  it('returns error for rating below 1', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1' } });
    const result = await upsertReview('c1', 'COURSE', 0);
    expect(result.success).toBe(false);
  });

  it('upserts review successfully', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1' } });
    (mockPrisma.review.upsert as jest.Mock).mockResolvedValue({});
    const result = await upsertReview('c1', 'COURSE', 4, 'Nice');
    expect(result.success).toBe(true);
    expect(mockPrisma.review.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_itemId_itemType: { userId: 'u1', itemId: 'c1', itemType: 'COURSE' } },
        update: { rating: 4, text: 'Nice' },
        create: { userId: 'u1', itemId: 'c1', itemType: 'COURSE', rating: 4, text: 'Nice' },
      }),
    );
  });
});

describe('deleteReview', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns false when not authenticated', async () => {
    mockAuth.mockResolvedValue(null);
    const result = await deleteReview('c1', 'COURSE');
    expect(result.success).toBe(false);
  });

  it('deletes review successfully', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1' } });
    (mockPrisma.review.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });
    const result = await deleteReview('c1', 'COURSE');
    expect(result.success).toBe(true);
  });
});

describe('getUserReview', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns null when not authenticated', async () => {
    mockAuth.mockResolvedValue(null);
    const result = await getUserReview('c1', 'COURSE');
    expect(result).toBeNull();
  });

  it('returns null when no review exists', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1' } });
    (mockPrisma.review.findUnique as jest.Mock).mockResolvedValue(null);
    const result = await getUserReview('c1', 'COURSE');
    expect(result).toBeNull();
  });

  it('returns review data when found', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1' } });
    (mockPrisma.review.findUnique as jest.Mock).mockResolvedValue({
      id: 'r1',
      userId: 'u1',
      itemId: 'c1',
      itemType: 'COURSE',
      rating: 5,
      text: 'Amazing',
      createdAt: new Date('2025-01-01'),
      user: { username: 'alice', avatar: 'https://example.com/avatar.jpg' },
    });
    const result = await getUserReview('c1', 'COURSE');
    expect(result).not.toBeNull();
    expect(result!.rating).toBe(5);
    expect(result!.username).toBe('alice');
  });
});
