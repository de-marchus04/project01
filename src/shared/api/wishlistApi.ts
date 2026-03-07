"use server";

import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/auth";

export interface WishlistItem {
  id: string;
  itemId: string;
  itemType: string;
  createdAt: string;
  title?: string;
  imageUrl?: string | null;
  price?: number;
  url?: string;
}

export async function addToWishlist(itemId: string, itemType: 'COURSE' | 'TOUR' | 'CONSULTATION'): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) return { success: false, error: 'Необходимо войти в аккаунт' };
  const userId = session.user.id;
  try {
    await prisma.wishlist.create({ data: { userId, itemId, itemType } });
    return { success: true };
  } catch (e) {
    console.error('addToWishlist error:', e);
    return { success: false, error: 'Уже в избранном' };
  }
}

export async function removeFromWishlist(itemId: string, itemType: 'COURSE' | 'TOUR' | 'CONSULTATION'): Promise<{ success: boolean }> {
  const session = await auth();
  if (!session?.user) return { success: false };
  const userId = session.user.id;
  await prisma.wishlist.deleteMany({ where: { userId, itemId, itemType } });
  return { success: true };
}

export async function isInWishlist(itemId: string, itemType: 'COURSE' | 'TOUR' | 'CONSULTATION'): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;
  const userId = session.user.id;
  const item = await prisma.wishlist.findFirst({ where: { userId, itemId, itemType } });
  return !!item;
}

export async function getUserWishlist(): Promise<WishlistItem[]> {
  const session = await auth();
  if (!session?.user) return [];
  const userId = session.user.id;

  const wishlistItems = await prisma.wishlist.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

  if (wishlistItems.length === 0) return [];

  // Group by item type to avoid N+1 queries
  const courseIds = wishlistItems.filter(i => i.itemType === 'COURSE').map(i => i.itemId);
  const consultationIds = wishlistItems.filter(i => i.itemType === 'CONSULTATION').map(i => i.itemId);
  const tourIds = wishlistItems.filter(i => i.itemType === 'TOUR').map(i => i.itemId);

  const [courses, consultations, tours] = await Promise.all([
    courseIds.length > 0
      ? prisma.course.findMany({ where: { id: { in: courseIds } }, select: { id: true, title: true, imageUrl: true, price: true } })
      : [],
    consultationIds.length > 0
      ? prisma.consultation.findMany({ where: { id: { in: consultationIds } }, select: { id: true, title: true, imageUrl: true, price: true } })
      : [],
    tourIds.length > 0
      ? prisma.tour.findMany({ where: { id: { in: tourIds } }, select: { id: true, title: true, imageUrl: true, price: true } })
      : [],
  ]);

  const courseMap = new Map(courses.map(c => [c.id, c]));
  const consultationMap = new Map(consultations.map(c => [c.id, c]));
  const tourMap = new Map(tours.map(t => [t.id, t]));

  const enriched = wishlistItems.map(item => {
    let title = '';
    let imageUrl: string | null = null;
    let price: number | undefined;
    let url = '';

    if (item.itemType === 'COURSE') {
      const d = courseMap.get(item.itemId);
      title = d?.title || '';
      imageUrl = d?.imageUrl ?? null;
      price = d?.price;
      url = `/courses/${item.itemId}`;
    } else if (item.itemType === 'CONSULTATION') {
      const d = consultationMap.get(item.itemId);
      title = d?.title || '';
      imageUrl = d?.imageUrl ?? null;
      price = d?.price;
      url = `/consultations/${item.itemId}`;
    } else if (item.itemType === 'TOUR') {
      const d = tourMap.get(item.itemId);
      title = d?.title || '';
      imageUrl = d?.imageUrl ?? null;
      price = d?.price;
      url = `/tours/${item.itemId}`;
    }

    return { id: item.id, itemId: item.itemId, itemType: item.itemType, createdAt: item.createdAt.toISOString(), title, imageUrl, price, url };
  });

  return JSON.parse(JSON.stringify(enriched));
}
