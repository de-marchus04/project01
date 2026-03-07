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

  const enriched = await Promise.all(wishlistItems.map(async (item) => {
    let title = '';
    let imageUrl: string | null = null;
    let price: number | undefined;
    let url = '';

    try {
      if (item.itemType === 'COURSE') {
        const course = await prisma.course.findUnique({ where: { id: item.itemId }, select: { title: true, imageUrl: true, price: true } });
        title = course?.title || '';
        imageUrl = course?.imageUrl ?? null;
        price = course?.price;
        url = `/courses/${item.itemId}`;
      } else if (item.itemType === 'CONSULTATION') {
        const cons = await prisma.consultation.findUnique({ where: { id: item.itemId }, select: { title: true, imageUrl: true, price: true } });
        title = cons?.title || '';
        imageUrl = cons?.imageUrl ?? null;
        price = cons?.price;
        url = `/consultations/${item.itemId}`;
      } else if (item.itemType === 'TOUR') {
        const tour = await prisma.tour.findUnique({ where: { id: item.itemId }, select: { title: true, imageUrl: true, price: true } });
        title = tour?.title || '';
        imageUrl = tour?.imageUrl ?? null;
        price = tour?.price;
        url = `/tours/${item.itemId}`;
      }
    } catch (e) {
      console.error('getUserWishlist enrichment error:', e);
    }

    return { id: item.id, itemId: item.itemId, itemType: item.itemType, createdAt: item.createdAt.toISOString(), title, imageUrl, price, url };
  }));

  return structuredClone(enriched);
}
