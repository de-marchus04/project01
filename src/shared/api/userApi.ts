'use server';

import { prisma } from '@/shared/lib/prisma';
import { auth } from '@/auth';
import { emailService } from '@/shared/api/emailService';

export interface Order {
  id: string;
  productName: string;
  price: number;
  status: string; // 'PENDING', 'COMPLETED', 'CANCELLED'
  date: string;
  customerName?: string;
  serviceId?: string;
  userId?: string;
  notified?: boolean;
  notes?: string;
}

export async function getOrders(): Promise<Order[]> {
  if (process.env.NEXT_RUNTIME === 'edge') {
    throw new Error('EDGE RUNTIME DETECTED IN SERVER ACTION');
  }
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('ACCESS_DENIED');
  const items = await prisma.order.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  });

  return JSON.parse(
    JSON.stringify(
      items.map((i) => {
        let mappedStatus = 'PENDING';
        if (i.status === 'COMPLETED') mappedStatus = 'COMPLETED';
        if (i.status === 'CANCELLED') mappedStatus = 'CANCELLED';
        return {
          id: i.id,
          productName: i.productName || `Product (${i.itemType})`,
          price: i.amount,
          status: mappedStatus,
          date: new Date(i.createdAt).toISOString().split('T')[0],
          customerName: i.user ? i.user.username : i.guestName || 'Guest',
          serviceId: i.itemId,
          userId: i.userId || undefined,
          notified: i.notified,
        };
      }),
    ),
  );
}

export async function addOrder(
  productName: string,
  clientPrice: number,
  customerName: string = 'Guest',
  serviceId?: string,
  username?: string,
  itemType: 'COURSE' | 'CONSULTATION' | 'TOUR' = 'COURSE',
  promoCodeId?: string,
  notes?: string,
): Promise<Order> {
  const session = await auth();

  // Server-side price verification
  let verifiedPrice = clientPrice;
  if (serviceId && serviceId !== 'unknown') {
    try {
      let dbItem: { price: number } | null = null;
      if (itemType === 'COURSE') {
        dbItem = await prisma.course.findUnique({ where: { id: serviceId }, select: { price: true } });
      } else if (itemType === 'CONSULTATION') {
        dbItem = await prisma.consultation.findUnique({ where: { id: serviceId }, select: { price: true } });
      } else if (itemType === 'TOUR') {
        dbItem = await prisma.tour.findUnique({ where: { id: serviceId }, select: { price: true } });
      }
      if (dbItem) verifiedPrice = dbItem.price;
    } catch {
      throw new Error('PRICE_VERIFY_FAILED');
    }
  }

  // Server-side promo code validation and discount application
  if (promoCodeId) {
    try {
      const promo = await prisma.promoCode.findUnique({ where: { id: promoCodeId } });
      if (
        promo &&
        promo.isActive &&
        (!promo.expiresAt || promo.expiresAt > new Date()) &&
        (promo.maxUses === null || promo.usedCount < promo.maxUses)
      ) {
        if (promo.discountType === 'PERCENT') {
          verifiedPrice = Math.round(verifiedPrice * (1 - promo.discountValue / 100) * 100) / 100;
        } else {
          verifiedPrice = Math.max(0, Math.round((verifiedPrice - promo.discountValue) * 100) / 100);
        }
      }
    } catch (e) {
      console.warn('[addOrder] Promo code lookup failed:', e);
    }
  }

  // Resolve real user id
  let resolvedUserId: string | null = null;
  const sessionUsername = session?.user?.username;
  const effectiveUsername = username || sessionUsername;
  if (effectiveUsername) {
    const user = await prisma.user.findFirst({ where: { username: effectiveUsername } });
    resolvedUserId = user?.id ?? null;
  }

  const newItem = await prisma.order.create({
    data: {
      ...(resolvedUserId ? { userId: resolvedUserId } : {}),
      guestName: resolvedUserId ? null : customerName,
      productName,
      itemId: serviceId || 'unknown',
      itemType,
      amount: verifiedPrice,
      status: 'PENDING',
      ...(notes ? { notes } : {}),
    },
  });

  // Increment promo code usage counter after order is created
  if (promoCodeId) {
    try {
      await prisma.promoCode.update({ where: { id: promoCodeId }, data: { usedCount: { increment: 1 } } });
    } catch (e) {
      console.warn('[addOrder] Failed to increment promo code usage:', e);
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yoga-platform-ruby.vercel.app';

  // Email confirmation to customer
  if (resolvedUserId) {
    try {
      const userRecord = await prisma.user.findUnique({ where: { id: resolvedUserId }, select: { email: true } });
      if (userRecord?.email) {
        await emailService.sendOrderConfirmation(
          userRecord.email,
          productName,
          verifiedPrice,
          notes,
          `${siteUrl}/profile`,
        );
      }
    } catch (e) {
      console.warn('[addOrder] Customer confirmation email failed:', e);
    }
  }

  // Email notification to admin/manager
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL;
  if (adminEmail) {
    try {
      const buyer = resolvedUserId ? customerName : `${customerName} (guest)`;
      await emailService.sendAdminOrderNotification(
        adminEmail,
        productName,
        buyer,
        verifiedPrice,
        notes,
        `${siteUrl}/admin`,
      );
    } catch (e) {
      console.warn('[addOrder] Admin notification email failed:', e);
    }
  }

  return JSON.parse(
    JSON.stringify({
      id: newItem.id,
      productName,
      price: newItem.amount,
      status: 'PENDING',
      date: new Date(newItem.createdAt).toISOString().split('T')[0],
      customerName,
      serviceId: newItem.itemId,
      userId: newItem.userId,
      notified: newItem.notified,
      notes: (newItem as any).notes,
    }),
  );
}

export async function updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('ACCESS_DENIED');
  let mappedStatus: any = 'PENDING';
  if (status === 'COMPLETED' || status === 'Принята' || status === 'Завершен' || status === 'Активен')
    mappedStatus = 'COMPLETED';
  if (status === 'CANCELLED' || status === 'Отклонена') mappedStatus = 'CANCELLED';

  const updated = await prisma.order.update({
    where: { id },
    data: { status: mappedStatus },
    include: { user: true },
  });

  // Send status notification email
  const userEmail = (updated as any).user?.email;
  const productName = (updated as any).productName || `Product (${updated.itemType})`;
  if (userEmail) {
    try {
      if (mappedStatus === 'COMPLETED' || mappedStatus === 'CANCELLED') {
        await emailService.sendOrderStatusUpdate(userEmail, productName, mappedStatus === 'COMPLETED');
      }
    } catch (e) {
      console.warn('[userApi] Email notification failed:', e);
    }
  }

  // Auto-generate promo code milestones (3 completed, then every 10)
  if (mappedStatus === 'COMPLETED' && updated.userId) {
    try {
      const completedCount = await prisma.order.count({
        where: { userId: updated.userId, status: 'COMPLETED' },
      });
      if (completedCount === 3 || (completedCount > 3 && (completedCount - 3) % 10 === 0)) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let promoCode = '';
        for (let i = 0; i < 8; i++) {
          promoCode += chars[Math.floor(Math.random() * chars.length)];
        }
        const existing = await prisma.promoCode.findUnique({ where: { code: promoCode } });
        if (!existing) {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 90);
          await prisma.promoCode.create({
            data: {
              code: promoCode,
              discountType: 'PERCENT',
              discountValue: 10,
              maxUses: 1,
              expiresAt,
              isActive: true,
            },
          });
          if (userEmail) {
            try {
              await emailService.sendPromoCodeEmail(userEmail, promoCode, completedCount);
            } catch (e) {
              console.warn('[userApi] Promo email failed:', e);
            }
          }
        }
      }
    } catch (e) {
      console.warn('[userApi] Auto-promo generation failed:', e);
    }
  }

  return JSON.parse(
    JSON.stringify({
      id: updated.id,
      productName: (updated as any).productName || `Product (${updated.itemType})`,
      price: updated.amount,
      status,
      date: new Date(updated.createdAt).toISOString().split('T')[0],
      customerName: updated.user ? updated.user.username : 'Guest',
      serviceId: updated.itemId,
      userId: updated.userId,
      notified: updated.notified,
    }),
  );
}

export async function deleteOrder(id: string): Promise<boolean> {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('ACCESS_DENIED');
  try {
    await prisma.order.delete({ where: { id } });
    return true;
  } catch (e) {
    console.error('deleteOrder error:', e);
    return false;
  }
}

export async function markOrderAsNotified(id: string): Promise<void> {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('ACCESS_DENIED');
  await prisma.order.update({ where: { id }, data: { notified: true } });
}

// For authenticated users: get their own orders
export async function getMyOrders(): Promise<Order[]> {
  if (process.env.NEXT_RUNTIME === 'edge') {
    throw new Error('EDGE RUNTIME DETECTED IN SERVER ACTION');
  }
  const session = await auth();
  if (!session?.user) throw new Error('AUTH_REQUIRED');
  const username = (session.user as any).username;
  const user = await prisma.user.findFirst({ where: { username } });
  if (!user) return [];
  const items = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });
  return JSON.parse(
    JSON.stringify(
      items.map((i) => ({
        id: i.id,
        productName: i.productName || `Product (${i.itemType})`,
        price: i.amount,
        status: i.status === 'COMPLETED' ? 'COMPLETED' : i.status === 'CANCELLED' ? 'CANCELLED' : 'PENDING',
        date: new Date(i.createdAt).toISOString().split('T')[0],
        customerName: username,
        serviceId: i.itemId,
        userId: i.userId ?? undefined,
        notified: i.notified,
        notes: (i as any).notes ?? undefined,
      })),
    ),
  );
}

// For authenticated users: mark their own order as notified
export async function markMyOrderAsNotified(id: string): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error('AUTH_REQUIRED');
  const username = (session.user as any).username;
  const user = await prisma.user.findFirst({ where: { username } });
  if (!user) throw new Error('USER_NOT_FOUND');
  // Only allow marking orders that belong to this user
  const order = await prisma.order.findFirst({ where: { id, userId: user.id } });
  if (!order) throw new Error('ORDER_NOT_FOUND');
  await prisma.order.update({ where: { id }, data: { notified: true } });
}
