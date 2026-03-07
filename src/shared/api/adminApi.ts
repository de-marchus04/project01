"use server";

import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/auth";

export async function bulkUpdateAuthor(authorName: string, authorPhotoUrl: string, oldAuthorName?: string) {
  const session = await auth();
  if ((session?.user)?.role !== 'ADMIN') throw new Error('Нет доступа');

  // Articles
  await prisma.article.updateMany({
    data: { author: authorName, authorPhoto: authorPhotoUrl },
  });
  
  // Courses
  await prisma.course.updateMany({
    data: { author: authorName, authorPhoto: authorPhotoUrl },
  });
  
  // Consultations
  await prisma.consultation.updateMany({
    data: { author: authorName, authorPhoto: authorPhotoUrl },
  });
  
  // Tours
  await prisma.tour.updateMany({
    data: { author: authorName, authorPhoto: authorPhotoUrl },
  });
  
  return true;
}
