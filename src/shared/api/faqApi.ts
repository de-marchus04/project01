'use server';

import { prisma } from '@/shared/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  translations?: any;
}

async function requireAdmin(): Promise<void> {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('Нет доступа');
}

export async function getFAQs(): Promise<FAQ[]> {
  if (process.env.NEXT_RUNTIME === 'edge') {
    throw new Error('EDGE RUNTIME DETECTED IN SERVER ACTION');
  }
  const items = await prisma.fAQ.findMany({ orderBy: { createdAt: 'desc' } });
  return JSON.parse(JSON.stringify(items));
}

const addFAQSchema = z.object({
  question: z.string().min(1).max(500),
  answer: z.string().min(1).max(5000),
  translations: z.any().optional(),
});

const updateFAQSchema = z.object({
  question: z.string().min(1).max(500).optional(),
  answer: z.string().min(1).max(5000).optional(),
  translations: z.any().optional(),
});

export async function addFAQ(faq: Omit<FAQ, 'id'>): Promise<FAQ> {
  await requireAdmin();
  const parsed = addFAQSchema.safeParse(faq);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || 'Некорректные данные');
  const item = await prisma.fAQ.create({ data: parsed.data });
  return JSON.parse(JSON.stringify(item));
}

export async function updateFAQ(id: string, updatedData: Partial<FAQ>): Promise<FAQ | null> {
  await requireAdmin();
  const parsed = updateFAQSchema.safeParse(updatedData);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || 'Некорректные данные');
  const item = await prisma.fAQ.update({ where: { id }, data: parsed.data });
  return JSON.parse(JSON.stringify(item));
}

export async function deleteFAQ(id: string): Promise<boolean> {
  await requireAdmin();
  try {
    await prisma.fAQ.delete({ where: { id } });
    return true;
  } catch (e) {
    console.error('deleteFAQ error:', e);
    return false;
  }
}
