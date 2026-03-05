"use server";

import { prisma } from "@/lib/prisma";

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
  const items = await prisma.order.findMany({
    include: {
      user: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return JSON.parse(JSON.stringify(items.map(i => {
    // Map to OrderStatus mock structure to keep frontend simple for now
    let mappedStatus = "В обработке";
    if (i.status === 'COMPLETED') mappedStatus = "Принята";
    if (i.status === 'CANCELLED') mappedStatus = "Отклонена";
    
    return {
      id: i.id,
      productName: `Товар (${i.itemType})`, // A real app would inner join but we just map for now to not break types
      price: i.amount,
      status: mappedStatus,
      date: new Date(i.createdAt).toISOString().split('T')[0],
      customerName: i.user ? i.user.username : 'Гость',
      serviceId: i.itemId,
      userId: i.userId,
      notified: false
    };
  })));
}

export async function addOrder(productName: string, price: number, customerName: string = "Гость", serviceId?: string, userId?: string): Promise<Order> {
  const actualUserId = userId || "mock-user-id";
  
  // Ensure a dummy user exists for now if taking unauth orders, or just create it.
  try {
    const defaultUser = await prisma.user.upsert({
      where: { id: actualUserId },
      update: {},
      create: {
        id: actualUserId,
        username: customerName,
        email: `${customerName}@example.com`,
        passwordHash: 'dummy'
      }
    });
  } catch (e) {
    // ignore
  }

  const newItem = await prisma.order.create({
    data: {
      userId: actualUserId,
      itemId: serviceId || 'unknown',
      itemType: 'COURSE', // hardcoded fallback
      amount: price,
      status: 'PENDING'
    }
  });

  return JSON.parse(JSON.stringify({
    id: newItem.id,
    productName,
    price: newItem.amount,
    status: "В обработке",
    date: new Date(newItem.createdAt).toISOString().split('T')[0],
    customerName,
    serviceId: newItem.itemId,
    userId: newItem.userId,
    notified: false
  }));
}

export async function updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
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
  
  return JSON.parse(JSON.stringify({
    id: updated.id,
    productName: `Товар (${updated.itemType})`,
    price: updated.amount,
    status,
    date: new Date(updated.createdAt).toISOString().split('T')[0],
    customerName: updated.user ? updated.user.username : 'Гость',
    serviceId: updated.itemId,
    userId: updated.userId,
    notified: false
  }));
}

export async function deleteOrder(id: string): Promise<boolean> {
  try {
    await prisma.order.delete({ where: { id } });
    return true;
  } catch (e) { return false; }
}

export async function markOrderAsNotified(id: string): Promise<void> {
  // Mock noop for now
}
