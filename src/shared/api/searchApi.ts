"use server";

import { prisma } from "@/shared/lib/prisma";

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string | null;
  price?: number;
  type: 'course' | 'consultation' | 'tour' | 'article';
  url: string;
}

export interface GlobalSearchResponse {
  courses: SearchResult[];
  consultations: SearchResult[];
  tours: SearchResult[];
  articles: SearchResult[];
  total: number;
}

export async function globalSearch(query: string): Promise<GlobalSearchResponse> {
  if (process.env.NEXT_RUNTIME === 'edge') { throw new Error('EDGE RUNTIME DETECTED IN SERVER ACTION'); }
  if (!query || query.trim().length < 2) {
    return { courses: [], consultations: [], tours: [], articles: [], total: 0 };
  }

  const q = query.trim().toLowerCase();
  const textFilter = (field: string) => ({ [field]: { contains: q, mode: 'insensitive' } });

  const [courses, consultations, tours, articles] = await Promise.all([
    prisma.course.findMany({
      where: { OR: [textFilter('title'), textFilter('description')] },
      take: 5,
      select: { id: true, title: true, description: true, imageUrl: true, price: true }
    }),
    prisma.consultation.findMany({
      where: { OR: [textFilter('title'), textFilter('description')] },
      take: 5,
      select: { id: true, title: true, description: true, imageUrl: true, price: true }
    }),
    prisma.tour.findMany({
      where: { OR: [textFilter('title'), textFilter('description')] },
      take: 5,
      select: { id: true, title: true, description: true, imageUrl: true, price: true }
    }),
    prisma.article.findMany({
      where: { OR: [textFilter('title'), textFilter('subtitle'), textFilter('content')] },
      take: 5,
      select: { id: true, title: true, subtitle: true, imageUrl: true }
    }),
  ]);

  const mapped = {
    courses: courses.map(c => ({ ...c, type: 'course' as const, url: `/courses/${c.id}` })),
    consultations: consultations.map(c => ({ ...c, type: 'consultation' as const, url: `/consultations/${c.id}` })),
    tours: tours.map(t => ({ ...t, type: 'tour' as const, url: `/tours/${t.id}` })),
    articles: articles.map(a => ({ id: a.id, title: a.title, description: a.subtitle || undefined, imageUrl: a.imageUrl, type: 'article' as const, url: `/blog/${a.id}` })),
  };

  return {
    ...mapped,
    total: mapped.courses.length + mapped.consultations.length + mapped.tours.length + mapped.articles.length,
  };
}
