'use server';

import { prisma } from '@/shared/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { Article, Video, Podcast, Recipe } from '@/entities/blog/model/types';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ----------------- ARTICLES -----------------
export async function getArticles(
  page: number = 1,
  limit: number = 6,
  tag?: string | null,
  searchQuery?: string,
): Promise<PaginatedResponse<Article>> {
  if (process.env.NEXT_RUNTIME === 'edge') {
    throw new Error('EDGE RUNTIME DETECTED IN SERVER ACTION');
  }
  const where: Prisma.ArticleWhereInput = {};
  if (tag) {
    where.tag = tag;
  }
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { subtitle: { contains: query, mode: 'insensitive' } },
      { content: { contains: query, mode: 'insensitive' } },
    ];
  }

  const safePage = Math.max(1, page);
  const skip = (safePage - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.article.count({ where }),
  ]);

  return JSON.parse(
    JSON.stringify({
      data: items,
      total,
      page: safePage,
      limit,
      totalPages: Math.ceil(total / limit),
    }),
  );
}

export async function getArticleTags(): Promise<string[]> {
  const items = await prisma.article.findMany({
    select: { tag: true },
    distinct: ['tag'],
  });
  return items.map((i) => i.tag).filter(Boolean) as string[];
}

export async function getArticleById(id: string): Promise<Article | undefined> {
  const item = await prisma.article.findUnique({ where: { id } });
  return item ? JSON.parse(JSON.stringify(item)) : undefined;
}

export async function getAllAdminArticles(): Promise<Article[]> {
  const items = await prisma.article.findMany({ orderBy: { createdAt: 'desc' } });
  return JSON.parse(JSON.stringify(items));
}

const addArticleSchema = z.object({
  title: z.string().min(1).max(500),
  subtitle: z.string().min(1).max(500),
  imageUrl: z.string().url().optional().nullable().or(z.literal('')),
  content: z.string().min(1).max(50000).optional(),
  author: z.string().max(200).optional(),
  authorPhoto: z.string().url().optional().nullable().or(z.literal('')),
  tag: z.string().max(100).optional(),
  translations: z.any().optional(),
});

const updateArticleSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  subtitle: z.string().min(1).max(500).optional(),
  imageUrl: z.string().url().optional().nullable().or(z.literal('')),
  content: z.string().min(1).max(50000).optional(),
  author: z.string().max(200).optional(),
  authorPhoto: z.string().url().optional().nullable().or(z.literal('')),
  tag: z.string().max(100).optional(),
  createdAt: z.string().optional(),
  translations: z.any().optional(),
});

export async function addArticle(article: Omit<Article, 'id' | 'createdAt'>): Promise<Article> {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('Нет доступа');
  const parsed = addArticleSchema.safeParse(article);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || 'Некорректные данные');
  const item = await prisma.article.create({ data: parsed.data as any });
  return JSON.parse(JSON.stringify(item));
}

export async function updateArticle(id: string, updatedData: Partial<Article>): Promise<Article | undefined> {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('Нет доступа');
  const parsed = updateArticleSchema.safeParse(updatedData);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || 'Некорректные данные');
  const item = await prisma.article.update({ where: { id }, data: parsed.data as any });
  return JSON.parse(JSON.stringify(item));
}

export async function deleteArticle(id: string): Promise<boolean> {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('Нет доступа');
  try {
    await prisma.article.delete({ where: { id } });
    return true;
  } catch (e) {
    console.error('deleteArticle error:', e);
    return false;
  }
}

// ----------------- VIDEOS -----------------
export async function getVideos(): Promise<Video[]> {
  const items = await prisma.video.findMany({ orderBy: { createdAt: 'desc' } });
  return JSON.parse(JSON.stringify(items));
}

const addVideoSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().min(1).max(500),
  videoUrl: z.string().url().optional().nullable().or(z.literal('')),
  thumbnailUrl: z.string().url().optional().nullable().or(z.literal('')),
  tag: z.string().max(100).optional(),
  translations: z.any().optional(),
});

const updateVideoSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().min(1).max(500).optional(),
  videoUrl: z.string().url().optional().nullable().or(z.literal('')),
  thumbnailUrl: z.string().url().optional().nullable().or(z.literal('')),
  tag: z.string().max(100).optional(),
  translations: z.any().optional(),
});

export async function addVideo(video: Omit<Video, 'id'>): Promise<Video> {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('Нет доступа');
  const parsed = addVideoSchema.safeParse(video);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || 'Некорректные данные');
  const item = await prisma.video.create({ data: parsed.data as any });
  return JSON.parse(JSON.stringify(item));
}

export async function updateVideo(id: string, data: Partial<Video>): Promise<Video | undefined> {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('Нет доступа');
  const parsed = updateVideoSchema.safeParse(data);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || 'Некорректные данные');
  const item = await prisma.video.update({ where: { id }, data: parsed.data as any });
  return JSON.parse(JSON.stringify(item));
}

export async function deleteVideo(id: string): Promise<boolean> {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('Нет доступа');
  try {
    await prisma.video.delete({ where: { id } });
    return true;
  } catch (e) {
    console.error('deleteVideo error:', e);
    return false;
  }
}

// ----------------- PODCASTS -----------------
export async function getPodcasts(): Promise<Podcast[]> {
  const items = await prisma.podcast.findMany({ orderBy: { createdAt: 'desc' } });
  return JSON.parse(JSON.stringify(items));
}

const addPodcastSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().min(1).max(500),
  audioUrl: z.string().url().optional().nullable().or(z.literal('')),
  duration: z.string().min(1).max(50),
  tag: z.string().max(100).optional(),
  translations: z.any().optional(),
});

const updatePodcastSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().min(1).max(500).optional(),
  audioUrl: z.string().url().optional().nullable().or(z.literal('')),
  duration: z.string().max(50).optional(),
  tag: z.string().max(100).optional(),
  translations: z.any().optional(),
});

export async function addPodcast(podcast: Omit<Podcast, 'id'>): Promise<Podcast> {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('Нет доступа');
  const parsed = addPodcastSchema.safeParse(podcast);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || 'Некорректные данные');
  const item = await prisma.podcast.create({ data: parsed.data as any });
  return JSON.parse(JSON.stringify(item));
}

export async function updatePodcast(id: string, data: Partial<Podcast>): Promise<Podcast | undefined> {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('Нет доступа');
  const parsed = updatePodcastSchema.safeParse(data);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || 'Некорректные данные');
  const item = await prisma.podcast.update({ where: { id }, data: parsed.data as any });
  return JSON.parse(JSON.stringify(item));
}

export async function deletePodcast(id: string): Promise<boolean> {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('Нет доступа');
  try {
    await prisma.podcast.delete({ where: { id } });
    return true;
  } catch (e) {
    console.error('deletePodcast error:', e);
    return false;
  }
}

// ----------------- RECIPES -----------------
export async function getRecipes(): Promise<Recipe[]> {
  const items = await prisma.recipe.findMany({ orderBy: { createdAt: 'desc' } });
  return JSON.parse(JSON.stringify(items));
}

const addRecipeSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().min(1).max(500),
  fullDescription: z.string().min(1).max(50000).optional(),
  imageUrl: z.string().url().optional().nullable().or(z.literal('')),
  time: z.string().min(1).max(100),
  tag: z.string().max(100).optional(),
  translations: z.any().optional(),
});

const updateRecipeSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().min(1).max(500).optional(),
  fullDescription: z.string().min(1).max(50000).optional(),
  imageUrl: z.string().url().optional().nullable().or(z.literal('')),
  time: z.string().max(100).optional(),
  tag: z.string().max(100).optional(),
  translations: z.any().optional(),
});

export async function addRecipe(recipe: Omit<Recipe, 'id'>): Promise<Recipe> {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('Нет доступа');
  const parsed = addRecipeSchema.safeParse(recipe);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || 'Некорректные данные');
  const item = await prisma.recipe.create({ data: parsed.data as any });
  return JSON.parse(JSON.stringify(item));
}

export async function updateRecipe(id: string, data: Partial<Recipe>): Promise<Recipe | undefined> {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('Нет доступа');
  const parsed = updateRecipeSchema.safeParse(data);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || 'Некорректные данные');
  const item = await prisma.recipe.update({ where: { id }, data: parsed.data as any });
  return JSON.parse(JSON.stringify(item));
}

export async function deleteRecipe(id: string): Promise<boolean> {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('Нет доступа');
  try {
    await prisma.recipe.delete({ where: { id } });
    return true;
  } catch (e) {
    console.error('deleteRecipe error:', e);
    return false;
  }
}
