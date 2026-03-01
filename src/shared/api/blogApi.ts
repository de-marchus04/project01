"use server";

import { prisma } from "@/lib/prisma";
import { Article, Video, Podcast, Recipe } from "@/entities/blog/model/types";

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ----------------- ARTICLES -----------------
export async function getArticles(page: number = 1, limit: number = 6, tag?: string | null, searchQuery?: string): Promise<PaginatedResponse<Article>> {
  if (process.env.NEXT_RUNTIME === 'edge') { throw new Error('EDGE RUNTIME DETECTED IN SERVER ACTION'); }
  const whereClause: any = {};
  if (tag) {
    whereClause.tag = tag;
  }
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    whereClause.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { subtitle: { contains: query, mode: 'insensitive' } },
      { content: { contains: query, mode: 'insensitive' } }
    ];
  }
  
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.article.count({ where: whereClause })
  ]);
  
  return JSON.parse(JSON.stringify({
    data: items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  }));
}

export async function getArticleTags(): Promise<string[]> {
  const items = await prisma.article.findMany({
    select: { tag: true },
    distinct: ['tag']
  });
  return items.map(i => i.tag).filter(Boolean) as string[];
}

export async function getArticleById(id: string): Promise<Article | undefined> {
  const item = await prisma.article.findUnique({ where: { id } });
  return item ? JSON.parse(JSON.stringify(item)) : undefined;
}

export async function getAllAdminArticles(): Promise<Article[]> {
  const items = await prisma.article.findMany({ orderBy: { createdAt: 'desc' } });
  return JSON.parse(JSON.stringify(items));
}

export async function addArticle(article: Omit<Article, 'id' | 'createdAt'>): Promise<Article> {
  const { translations, id: _mockId, ...validData } = article as any;
  const item = await prisma.article.create({ data: validData });
  return JSON.parse(JSON.stringify(item));
}

export async function updateArticle(id: string, updatedData: Partial<Article>): Promise<Article | undefined> {
  const { translations, id: _id, ...validData } = updatedData as any;
  const item = await prisma.article.update({ where: { id }, data: validData });
  return JSON.parse(JSON.stringify(item));
}

export async function deleteArticle(id: string): Promise<boolean> {
  try {
    await prisma.article.delete({ where: { id } });
    return true;
  } catch (e) { return false; }
}

// ----------------- VIDEOS -----------------
export async function getVideos(): Promise<Video[]> {
  const items = await prisma.video.findMany({ orderBy: { createdAt: 'desc' } });
  return JSON.parse(JSON.stringify(items));
}

export async function addVideo(video: Omit<Video, 'id'>): Promise<Video> {
  const { translations, id: _mockId, ...validData } = video as any;
  const item = await prisma.video.create({ data: validData });
  return JSON.parse(JSON.stringify(item));
}

export async function updateVideo(id: string, data: Partial<Video>): Promise<Video | undefined> {
  const { translations, id: _id, ...validData } = data as any;
  const item = await prisma.video.update({ where: { id }, data: validData });
  return JSON.parse(JSON.stringify(item));
}

export async function deleteVideo(id: string): Promise<boolean> {
  try { await prisma.video.delete({ where: { id } }); return true; } catch (e) { return false; }
}

// ----------------- PODCASTS -----------------
export async function getPodcasts(): Promise<Podcast[]> {
  const items = await prisma.podcast.findMany({ orderBy: { createdAt: 'desc' } });
  return JSON.parse(JSON.stringify(items));
}

export async function addPodcast(podcast: Omit<Podcast, 'id'>): Promise<Podcast> {
  const { translations, id: _mockId, ...validData } = podcast as any;
  const item = await prisma.podcast.create({ data: validData });
  return JSON.parse(JSON.stringify(item));
}

export async function updatePodcast(id: string, data: Partial<Podcast>): Promise<Podcast | undefined> {
  const { translations, id: _id, ...validData } = data as any;
  const item = await prisma.podcast.update({ where: { id }, data: validData });
  return JSON.parse(JSON.stringify(item));
}

export async function deletePodcast(id: string): Promise<boolean> {
  try { await prisma.podcast.delete({ where: { id } }); return true; } catch (e) { return false; }
}

// ----------------- RECIPES -----------------
export async function getRecipes(): Promise<Recipe[]> {
  const items = await prisma.recipe.findMany({ orderBy: { createdAt: 'desc' } });
  return JSON.parse(JSON.stringify(items));
}

export async function addRecipe(recipe: Omit<Recipe, 'id'>): Promise<Recipe> {
  const { translations, id: _mockId, ...validData } = recipe as any;
  const item = await prisma.recipe.create({ data: validData });
  return JSON.parse(JSON.stringify(item));
}

export async function updateRecipe(id: string, data: Partial<Recipe>): Promise<Recipe | undefined> {
  const { translations, id: _id, ...validData } = data as any;
  const item = await prisma.recipe.update({ where: { id }, data: validData });
  return JSON.parse(JSON.stringify(item));
}

export async function deleteRecipe(id: string): Promise<boolean> {
  try { await prisma.recipe.delete({ where: { id } }); return true; } catch (e) { return false; }
}
