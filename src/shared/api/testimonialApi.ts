'use server';

import { prisma } from '@/shared/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

async function requireAdmin(): Promise<void> {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('Нет доступа');
}

export interface Testimonial {
  id: string;
  name: string;
  course: string;
  text: string;
  createdAt: string | Date;
}

export async function getTestimonials(): Promise<Testimonial[]> {
  if (process.env.NEXT_RUNTIME === 'edge') {
    throw new Error('EDGE RUNTIME DETECTED IN SERVER ACTION');
  }
  const items = await prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } });
  return JSON.parse(JSON.stringify(items));
}

const addTestimonialSchema = z.object({
  name: z.string().min(1).max(100),
  course: z.string().min(1).max(200),
  text: z.string().min(1).max(2000),
});

const updateTestimonialSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  course: z.string().min(1).max(200).optional(),
  text: z.string().min(1).max(2000).optional(),
});

export async function addTestimonial(testimonial: Omit<Testimonial, 'id' | 'createdAt'>): Promise<Testimonial> {
  await requireAdmin();
  const parsed = addTestimonialSchema.safeParse(testimonial);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || 'Некорректные данные');
  const item = await prisma.testimonial.create({ data: parsed.data });
  return JSON.parse(JSON.stringify(item));
}

export async function updateTestimonial(id: string, updates: Partial<Testimonial>): Promise<Testimonial | null> {
  await requireAdmin();
  const parsed = updateTestimonialSchema.safeParse(updates);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || 'Некорректные данные');
  const item = await prisma.testimonial.update({ where: { id }, data: parsed.data });
  return JSON.parse(JSON.stringify(item));
}

export async function deleteTestimonial(id: string): Promise<boolean> {
  await requireAdmin();
  try {
    await prisma.testimonial.delete({ where: { id } });
    return true;
  } catch (e) {
    return false;
  }
}
