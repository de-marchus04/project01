"use server";

import { prisma } from "@/shared/lib/prisma";

export interface Testimonial {
  id: string;
  name: string;
  course: string;
  text: string;
  createdAt: string | Date;
}

export async function getTestimonials(): Promise<Testimonial[]> {
  if (process.env.NEXT_RUNTIME === 'edge') { throw new Error('EDGE RUNTIME DETECTED IN SERVER ACTION'); }
  const items = await prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } });
  return JSON.parse(JSON.stringify(items));
}

export async function addTestimonial(testimonial: Omit<Testimonial, 'id' | 'createdAt'>): Promise<Testimonial> {
  const { id: _mockId, createdAt: _ca, ...validData } = testimonial as any;
  const item = await prisma.testimonial.create({ data: validData });
  return JSON.parse(JSON.stringify(item));
}

export async function updateTestimonial(id: string, updates: Partial<Testimonial>): Promise<Testimonial | null> {
  const { id: _id, createdAt: _ca, ...validData } = updates as any;
  const item = await prisma.testimonial.update({ where: { id }, data: validData });
  return JSON.parse(JSON.stringify(item));
}

export async function deleteTestimonial(id: string): Promise<boolean> {
  try {
    await prisma.testimonial.delete({ where: { id } });
    return true;
  } catch (e) {
    return false;
  }
}
