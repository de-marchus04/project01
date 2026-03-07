"use server";

import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/auth";
import { emailService } from "@/shared/api/emailService";

export interface Order {
  id: string;
  productName: string;
  price: number;
  status: string; // 'В обработке', 'Принята', 'Отклонена', 'Активен', 'Завершен'
  date: string;
  customerName?: string;
  serviceId?: string;
  userId?: string;
  notified?: boolean;
}

export async function getOrders(): Promise<Order[]> {
  if (process.env.NEXT_RUNTIME === 'edge') { throw new Error('EDGE RUNTIME DETECTED IN SERVER ACTION'); }
  const session = await auth();
  if ((session?.user)?.role !== 'ADMIN') throw new Error('Нет доступа');
  const items = await prisma.order.findMany({
    include: {
      user: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return structuredClone(items.map(i => {
    // Map to OrderStatus mock structure to keep frontend simple for now
    let mappedStatus = "В обработке";
    if (i.status === 'COMPLETED') mappedStatus = "Принята";
    if (i.status === 'CANCELLED') mappedStatus = "Отклонена";
    
    return {
      id: i.id,
      productName: i.productName || `Товар (${i.itemType})`,
      price: i.amount,
      status: mappedStatus,
      date: new Date(i.createdAt).toISOString().split('T')[0],
      customerName: i.user ? i.user.username : (i.guestName || 'Гость'),
      serviceId: i.itemId,
      userId: i.userId || undefined,
      notified: false
    };
  }));
}

export async function addOrder(
  productName: string,
  clientPrice: number,
  customerName: string = "Гость",
  serviceId?: string,
  username?: string,
  itemType: 'COURSE' | 'CONSULTATION' | 'TOUR' = 'COURSE'
): Promise<Order> {
  // Require authentication — guests may still place orders but must be identifiable
  const session = await auth();

  // Server-side price verification: look up the real price from DB
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
      // If price lookup fails, reject the order rather than using client price
      throw new Error('Не удалось проверить стоимость товара');
    }
  }

  // Resolve real user id
  let resolvedUserId: string | null = null;
  const sessionUsername = (session?.user)?.username;
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
      status: 'PENDING'
    }
  });

  return structuredClone({
    id: newItem.id,
    productName,
    price: newItem.amount,
    status: "В обработке",
    date: new Date(newItem.createdAt).toISOString().split('T')[0],
    customerName,
    serviceId: newItem.itemId,
    userId: newItem.userId,
    notified: false
  });
}

export async function updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
  const session = await auth();
  if ((session?.user)?.role !== 'ADMIN') throw new Error('Нет доступа');
  let mappedStatus: any = 'PENDING';
  if (status === 'Принята' || status === 'Завершен' || status === 'Активен') mappedStatus = 'COMPLETED';
  if (status === 'Отклонена') mappedStatus = 'CANCELLED';

  const updated = await prisma.order.update({
    where: { id },
    data: { status: mappedStatus },
    include: {
      user: true
    }
  });

  // Send status notification email
  const userEmail = (updated as any).user?.email;
  const productName = (updated as any).productName || `Товар (${updated.itemType})`;
  if (userEmail) {
    try {
      if (mappedStatus === 'COMPLETED') {
        await emailService.sendEmail(
          userEmail,
          `Статус вашей заявки «${productName}» — YOGA.LIFE`,
          `Здравствуйте!\n\nВаша заявка на «${productName}» принята. Менеджер свяжется с вами в ближайшее время.\n\nС уважением, команда YOGA.LIFE`
        );
      } else if (mappedStatus === 'CANCELLED') {
        await emailService.sendEmail(
          userEmail,
          `Статус вашей заявки «${productName}» — YOGA.LIFE`,
          `Здравствуйте!\n\nВаша заявка на «${productName}» была отклонена. Если у вас есть вопросы, свяжитесь с нами.\n\nС уважением, команда YOGA.LIFE`
        );
      }
    } catch (e) {
      console.warn('[userApi] Email notification failed:', e);
    }
  }

  return structuredClone({
    id: updated.id,
    productName: (updated as any).productName || `Товар (${updated.itemType})`,
    price: updated.amount,
    status,
    date: new Date(updated.createdAt).toISOString().split('T')[0],
    customerName: updated.user ? updated.user.username : 'Гость',
    serviceId: updated.itemId,
    userId: updated.userId,
    notified: false
  });
}

export async function deleteOrder(id: string): Promise<boolean> {
  const session = await auth();
  if ((session?.user)?.role !== 'ADMIN') throw new Error('Нет доступа');
  try {
    await prisma.order.delete({ where: { id } });
    return true;
  } catch (e) {
    console.error('deleteOrder error:', e);
    return false;
  }
}

export async function markOrderAsNotified(id: string): Promise<void> {
  // Mock noop for now
}
