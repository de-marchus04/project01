'use server';

import { prisma } from '@/shared/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';
import { Tour } from '@/entities/tour/model/types';

export async function getTours(): Promise<Tour[]> {
  if (process.env.NEXT_RUNTIME === 'edge') {
    throw new Error('EDGE RUNTIME DETECTED IN SERVER ACTION');
  }
  const items = await prisma.tour.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });
  return JSON.parse(JSON.stringify(items));
}

export async function getAllTours(): Promise<Tour[]> {
  if (process.env.NEXT_RUNTIME === 'edge') {
    throw new Error('EDGE RUNTIME DETECTED IN SERVER ACTION');
  }
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('Нет доступа');
  const items = await prisma.tour.findMany({ orderBy: { createdAt: 'desc' } });
  return JSON.parse(JSON.stringify(items));
}

export async function getTourById(id: string): Promise<Tour | undefined> {
  const item = await prisma.tour.findUnique({
    where: { id },
  });
  return item ? JSON.parse(JSON.stringify(item)) : undefined;
}

const addTourSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().min(1).max(500),
  price: z.number().positive().max(9999999),
  currency: z.string().max(10).optional(),
  imageUrl: z.string().url().optional().nullable().or(z.literal('')),
  date: z.string().min(1).max(200).optional(),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  location: z.string().min(1).max(200).optional(),
  author: z.string().max(200).optional(),
  authorPhoto: z.string().url().optional().nullable().or(z.literal('')),
  fullDescription: z.string().max(50000).optional(),
  features: z.array(z.string()).optional(),
  translations: z.any().optional(),
});

const updateTourSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().min(1).max(500).optional(),
  price: z.number().positive().max(9999999).optional(),
  currency: z.string().max(10).optional(),
  imageUrl: z.string().url().optional().nullable().or(z.literal('')),
  date: z.string().max(200).optional(),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  location: z.string().max(200).optional(),
  author: z.string().max(200).optional(),
  authorPhoto: z.string().url().optional().nullable().or(z.literal('')),
  fullDescription: z.string().max(50000).optional(),
  features: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  translations: z.any().optional(),
});

export async function addTour(tourData: Omit<Tour, 'id'>): Promise<Tour> {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('Нет доступа');
  const parsed = addTourSchema.safeParse(tourData);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || 'Некорректные данные');
  const newItem = await prisma.tour.create({
    data: {
      ...parsed.data,
    },
  });
  return JSON.parse(JSON.stringify(newItem));
}

export async function updateTour(id: string, updatedData: Partial<Tour>): Promise<Tour | undefined> {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('Нет доступа');
  const parsed = updateTourSchema.safeParse(updatedData);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || 'Некорректные данные');
  const updated = await prisma.tour.update({
    where: { id },
    data: parsed.data,
  });
  return JSON.parse(JSON.stringify(updated));
}

export async function deleteTour(id: string): Promise<boolean> {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('Нет доступа');
  try {
    await prisma.tour.delete({ where: { id } });
    return true;
  } catch (e) {
    console.error('deleteTour error:', e);
    return false;
  }
}
