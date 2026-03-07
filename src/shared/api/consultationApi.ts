"use server";

import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";
import { Consultation } from "@/entities/consultation/model/types";

export async function getConsultationById(id: string): Promise<Consultation | undefined> {
  if (process.env.NEXT_RUNTIME === 'edge') { throw new Error('EDGE RUNTIME DETECTED IN SERVER ACTION'); }
  const consultation = await prisma.consultation.findUnique({
    where: { id }
  });
  return consultation ? JSON.parse(JSON.stringify(consultation)) : undefined;
}

export async function getPrivateConsultations(): Promise<Consultation[]> {
  const items = await prisma.consultation.findMany({
    where: { category: { startsWith: 'private' } }
  });
  return JSON.parse(JSON.stringify(items));
}

export async function getNutritionConsultations(): Promise<Consultation[]> {
  const items = await prisma.consultation.findMany({
    where: { category: { startsWith: 'nutrition' } }
  });
  return JSON.parse(JSON.stringify(items));
}

export async function getMentorshipConsultations(): Promise<Consultation[]> {
  const items = await prisma.consultation.findMany({
    where: { category: { startsWith: 'mentorship' } }
  });
  return JSON.parse(JSON.stringify(items));
}

export async function getAllAdminConsultations(): Promise<Consultation[]> {
  const items = await prisma.consultation.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return JSON.parse(JSON.stringify(items));
}

export async function getAllConsultations(): Promise<Consultation[]> {
  const items = await prisma.consultation.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return JSON.parse(JSON.stringify(items));
}

const addConsultationSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().min(1).max(500),
  price: z.number().positive().max(999999),
  imageUrl: z.string().url().optional().nullable().or(z.literal('')),
  author: z.string().max(200).optional(),
  authorPhoto: z.string().url().optional().nullable().or(z.literal('')),
  fullDescription: z.string().max(50000).optional(),
  features: z.array(z.string()).optional(),
  category: z.string().max(100).optional(),
});

const addConsultationCategorySchema = z.string().min(1).max(100);

const updateConsultationSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().min(1).max(500).optional(),
  price: z.number().positive().max(999999).optional(),
  imageUrl: z.string().url().optional().nullable().or(z.literal('')),
  author: z.string().max(200).optional(),
  authorPhoto: z.string().url().optional().nullable().or(z.literal('')),
  fullDescription: z.string().max(50000).optional(),
  features: z.array(z.string()).optional(),
  category: z.string().max(100).optional(),
});

export async function addConsultation(consultationData: Omit<Consultation, 'id'>, category: string): Promise<Consultation> {
  const session = await auth();
  if ((session?.user)?.role !== 'ADMIN') throw new Error('Нет доступа');
  const parsedCategory = addConsultationCategorySchema.safeParse(category);
  if (!parsedCategory.success) throw new Error(parsedCategory.error.errors[0]?.message || 'Некорректная категория');
  const parsed = addConsultationSchema.safeParse(consultationData);
  if (!parsed.success) throw new Error(parsed.error.errors[0]?.message || 'Некорректные данные');
  const newItem = await prisma.consultation.create({
    data: {
      ...parsed.data,
      category: parsedCategory.data,
      id: `${parsedCategory.data}-${Date.now()}`
    } as any
  });
  return JSON.parse(JSON.stringify(newItem));
}

export async function updateConsultation(id: string, updatedData: Partial<Consultation>): Promise<Consultation | undefined> {
  const session = await auth();
  if ((session?.user)?.role !== 'ADMIN') throw new Error('Нет доступа');
  const parsed = updateConsultationSchema.safeParse(updatedData);
  if (!parsed.success) throw new Error(parsed.error.errors[0]?.message || 'Некорректные данные');
  const updated = await prisma.consultation.update({
    where: { id },
    data: parsed.data
  });
  return JSON.parse(JSON.stringify(updated));
}

export async function deleteConsultation(id: string): Promise<boolean> {
  const session = await auth();
  if ((session?.user)?.role !== 'ADMIN') throw new Error('Нет доступа');
  try {
    await prisma.consultation.delete({ where: { id } });
    return true;
  } catch (e) {
    console.error('deleteConsultation error:', e);
    return false;
  }
}
