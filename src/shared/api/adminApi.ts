"use server";

import { prisma } from "@/shared/lib/prisma";

export async function bulkUpdateAuthor(authorName: string, authorPhotoUrl: string, oldAuthorName?: string) {
  // We'll just update everything that has an author field or lacks one, roughly simulating the old localstorage loop.
  
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
