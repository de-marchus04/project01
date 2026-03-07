"use server";

import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/auth";

export async function bulkUpdateAuthor(authorName: string, authorPhotoUrl: string, oldAuthorName?: string) {
  const session = await auth();
  if ((session?.user)?.role !== 'ADMIN') throw new Error('Нет доступа');

  if (!oldAuthorName) return true;

  const where = { author: oldAuthorName };
  const data = { author: authorName, authorPhoto: authorPhotoUrl };

  // Articles
  await prisma.article.updateMany({ where, data });

  // Courses
  await prisma.course.updateMany({ where, data });

  // Consultations
  await prisma.consultation.updateMany({ where, data });

  // Tours
  await prisma.tour.updateMany({ where, data });

  return true;
}
