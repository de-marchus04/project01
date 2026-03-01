"use server";

import { prisma } from "@/lib/prisma";

export interface Tour {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  date: string;
  location: string;
  author?: string;
  authorPhoto?: string;
  translations?: any;
  features?: string[];
  fullDescription?: string;
}

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
  const { translations, id: _id, ...validData } = updatedData as any;
  const updated = await prisma.tour.update({
    where: { id },
    data: validData
  });
  return JSON.parse(JSON.stringify(updated));
}

export async function deleteTour(id: string): Promise<boolean> {
  try {
    await prisma.tour.delete({ where: { id } });
    return true;
  } catch (e) {
    return false;
  }
}
