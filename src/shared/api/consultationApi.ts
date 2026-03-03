"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Course } from "@/entities/course/model/types";

export async function getConsultationById(id: string): Promise<Course | undefined> {
  if (process.env.NEXT_RUNTIME === 'edge') { throw new Error('EDGE RUNTIME DETECTED IN SERVER ACTION'); }
  const consultation = await prisma.consultation.findUnique({
    where: { id }
  });
  return consultation ? JSON.parse(JSON.stringify(consultation)) : undefined;
}

export async function getPrivateConsultations(): Promise<Course[]> {
  const items = await prisma.consultation.findMany({
    where: { category: { startsWith: 'private' } }
  });
  return JSON.parse(JSON.stringify(items));
}

export async function getNutritionConsultations(): Promise<Course[]> {
  const items = await prisma.consultation.findMany({
    where: { category: { startsWith: 'nutrition' } }
  });
  return JSON.parse(JSON.stringify(items));
}

export async function getMentorshipConsultations(): Promise<Course[]> {
  const items = await prisma.consultation.findMany({
    where: { category: { startsWith: 'mentorship' } }
  });
  return JSON.parse(JSON.stringify(items));
}

export async function getAllAdminConsultations(): Promise<Course[]> {
  const items = await prisma.consultation.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return JSON.parse(JSON.stringify(items));
}

export async function addConsultation(consultationData: Omit<Course, 'id'>, category: string): Promise<Course> {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Нет доступа');
  const { translations, id: _mockId, ...validData } = consultationData as any;
  const newItem = await prisma.consultation.create({
    data: {
      ...validData,
      category: category,
      id: `${category}-${Date.now()}`
    } as any
  });
  return JSON.parse(JSON.stringify(newItem));
}

export async function updateConsultation(id: string, updatedData: Partial<Course>): Promise<Course | undefined> {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Нет доступа');
  const { translations, id: _id, ...validData } = updatedData as any;
  const updated = await prisma.consultation.update({
    where: { id },
    data: validData
  });
  return JSON.parse(JSON.stringify(updated));
}

export async function deleteConsultation(id: string): Promise<boolean> {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Нет доступа');
    await prisma.consultation.delete({ where: { id } });
    return true;
  } catch (e) {
    return false;
  }
}
