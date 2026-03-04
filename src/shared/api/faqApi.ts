"use server";

import { prisma } from "@/shared/lib/prisma";

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  translations?: any;
}

export async function getFAQs(): Promise<FAQ[]> {
  if (process.env.NEXT_RUNTIME === 'edge') { throw new Error('EDGE RUNTIME DETECTED IN SERVER ACTION'); }
  const items = await prisma.fAQ.findMany({ orderBy: { createdAt: 'desc' } });
  return JSON.parse(JSON.stringify(items));
}

export async function addFAQ(faq: Omit<FAQ, 'id'>): Promise<FAQ> {
  const { translations, id: _mockId, ...validData } = faq as any;
  const item = await prisma.fAQ.create({ data: validData });
  return JSON.parse(JSON.stringify(item));
}

export async function updateFAQ(id: string, updatedData: Partial<FAQ>): Promise<FAQ | null> {
  const { translations, id: _id, ...validData } = updatedData as any;
  const item = await prisma.fAQ.update({ where: { id }, data: validData });
  return JSON.parse(JSON.stringify(item));
}

export async function deleteFAQ(id: string): Promise<void> {
  await prisma.fAQ.delete({ where: { id } });
}
