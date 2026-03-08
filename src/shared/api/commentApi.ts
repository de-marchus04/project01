'use server';

import { prisma } from '@/shared/lib/prisma';
import { rateLimit } from '@/shared/lib/rateLimit';
import { auth } from '@/auth';
import { headers } from 'next/headers';

export interface Comment {
  id: string;
  articleId: string;
  name: string;
  text: string;
  createdAt: string;
}

export async function getComments(articleId: string): Promise<Comment[]> {
  const items = await prisma.comment.findMany({
    where: { articleId },
    orderBy: { createdAt: 'asc' },
  });
  return items.map((c: (typeof items)[number]) => ({
    id: c.id,
    articleId: c.articleId,
    name: c.name,
    text: c.text,
    createdAt: new Date(c.createdAt).toISOString(),
  }));
}

export async function addComment(articleId: string, name: string, text: string): Promise<Comment> {
  if (!articleId || !name?.trim() || !text?.trim()) {
    throw new Error('Все поля обязательны');
  }
  if (name.length > 100) throw new Error('Имя слишком длинное');
  if (text.length > 2000) throw new Error('Текст комментария слишком длинный');

  const hdrs = await headers();
  const ip = hdrs.get('x-forwarded-for') ?? hdrs.get('x-real-ip') ?? 'unknown';
  const rl = await rateLimit(`comment:${ip}`, { windowMs: 60_000, max: 5 });
  if (!rl.success) throw new Error('Слишком много комментариев. Попробуйте позже.');

  const created = await prisma.comment.create({
    data: {
      articleId,
      name: name.trim(),
      text: text.trim(),
    },
  });

  return {
    id: created.id,
    articleId: created.articleId,
    name: created.name,
    text: created.text,
    createdAt: new Date(created.createdAt).toISOString(),
  };
}

export async function deleteComment(id: string): Promise<void> {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Нет доступа');
  await prisma.comment.delete({ where: { id } });
}
