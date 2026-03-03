"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export interface ReviewData {
  id: string;
  userId: string;
  username: string;
  avatar?: string | null;
  itemId: string;
  itemType: string;
  rating: number;
  text?: string | null;
  createdAt: string;
}

export interface ReviewStats {
  average: number;
  total: number;
  distribution: Record<number, number>; // 1-5: count
}

export async function getItemReviews(itemId: string, itemType: 'COURSE' | 'TOUR' | 'CONSULTATION'): Promise<{ reviews: ReviewData[]; stats: ReviewStats }> {
  const reviews = await prisma.review.findMany({
    where: { itemId, itemType },
    include: { user: { select: { username: true, avatar: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach(r => { distribution[r.rating] = (distribution[r.rating] || 0) + 1; });
  const total = reviews.length;
  const average = total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;

  return JSON.parse(JSON.stringify({
    reviews: reviews.map(r => ({
      id: r.id,
      userId: r.userId,
      username: r.user.username,
      avatar: r.user.avatar,
      itemId: r.itemId,
      itemType: r.itemType,
      rating: r.rating,
      text: r.text,
      createdAt: r.createdAt,
    })),
    stats: { average: Math.round(average * 10) / 10, total, distribution },
  }));
}

export async function getUserReview(itemId: string, itemType: 'COURSE' | 'TOUR' | 'CONSULTATION'): Promise<ReviewData | null> {
  const session = await auth();
  if (!session?.user) return null;
  const userId = (session.user as any).id as string;

  const review = await prisma.review.findUnique({
    where: { userId_itemId_itemType: { userId, itemId, itemType } },
    include: { user: { select: { username: true, avatar: true } } },
  });
  if (!review) return null;

  return JSON.parse(JSON.stringify({
    id: review.id,
    userId: review.userId,
    username: review.user.username,
    avatar: review.user.avatar,
    itemId: review.itemId,
    itemType: review.itemType,
    rating: review.rating,
    text: review.text,
    createdAt: review.createdAt,
  }));
}

export async function upsertReview(
  itemId: string,
  itemType: 'COURSE' | 'TOUR' | 'CONSULTATION',
  rating: number,
  text?: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) return { success: false, error: 'Необходимо войти в аккаунт' };
  const userId = (session.user as any).id as string;

  if (rating < 1 || rating > 5) return { success: false, error: 'Оценка должна быть от 1 до 5' };

  await prisma.review.upsert({
    where: { userId_itemId_itemType: { userId, itemId, itemType } },
    update: { rating, text: text || null },
    create: { userId, itemId, itemType, rating, text: text || null },
  });
  return { success: true };
}

export async function deleteReview(itemId: string, itemType: 'COURSE' | 'TOUR' | 'CONSULTATION'): Promise<{ success: boolean }> {
  const session = await auth();
  if (!session?.user) return { success: false };
  const userId = (session.user as any).id as string;
  await prisma.review.deleteMany({ where: { userId, itemId, itemType } });
  return { success: true };
}
