"use server";

import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/auth";
import { Tour } from "@/entities/tour/model/types";

export async function getTours(): Promise<Tour[]> {
  if (process.env.NEXT_RUNTIME === 'edge') { throw new Error('EDGE RUNTIME DETECTED IN SERVER ACTION'); }
  const items = await prisma.tour.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return JSON.parse(JSON.stringify(items));
}

export async function getTourById(id: string): Promise<Tour | undefined> {
  const item = await prisma.tour.findUnique({
    where: { id }
  });
  return item ? JSON.parse(JSON.stringify(item)) : undefined;
}

export async function addTour(tourData: Omit<Tour, 'id'>): Promise<Tour> {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Нет доступа');
  const { translations, id: _mockId, ...validData } = tourData as any;
  const newItem = await prisma.tour.create({
    data: {
      ...validData,
      id: `tour-${Date.now()}`
    } as any
  });
  return JSON.parse(JSON.stringify(newItem));
}

export async function updateTour(id: string, updatedData: Partial<Tour>): Promise<Tour | undefined> {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Нет доступа');
  const { translations, id: _id, ...validData } = updatedData as any;
  const updated = await prisma.tour.update({
    where: { id },
    data: validData
  });
  return JSON.parse(JSON.stringify(updated));
}

export async function deleteTour(id: string): Promise<boolean> {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Нет доступа');
    await prisma.tour.delete({ where: { id } });
    return true;
  } catch (e) {
    return false;
  }
}
